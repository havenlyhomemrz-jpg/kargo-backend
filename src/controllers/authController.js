const jwt = require('jsonwebtoken');
const { findAdminByIdentifier, verifyUserPassword } = require('../models/userModel');
const { loginStore } = require('../models/storeModel');
const { loginCourier } = require('../models/courierModel');

const JWT_EXPIRES_IN = '4h';

function getJwtSecret() {
  return process.env.JWT_SECRET || 'secret-key';
}

async function login(req, res) {
  const { role, name, code } = req.body;
  if (!role || !name || !code) {
    return res.status(400).json({ error: 'Rol, ad və kod tələb olunur' });
  }

  try {
    let user = null;

    if (role === 'admin') {
      const adminUser = await findAdminByIdentifier(name);
      if (adminUser && await verifyUserPassword(adminUser, code)) {
        user = adminUser;
      }
    } else if (role === 'store') {
      user = await loginStore(name, code);
    } else if (role === 'courier') {
      user = await loginCourier(name, code);
    } else {
      return res.status(400).json({ error: 'Yanlış rol' });
    }

    if (!user) {
      return res.status(401).json({ error: 'İstifadəçi adı və ya kod yanlışdır' });
    }

    const payload = {
      sub: user.id,
      name: user.name,
      role
    };

    if (role !== 'admin') {
      payload.code = user.code;
    }

    const token = jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role,
        ...(role !== 'admin' ? { code: user.code } : {})
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Giris zamani xeta bas verdi' });
  }
}

module.exports = {
  login
};
