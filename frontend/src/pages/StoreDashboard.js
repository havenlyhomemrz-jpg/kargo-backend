import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Dashboard.css';
import { API_BASE_URL } from '../apiBase';

function StoreDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const themeStorageKey = 'app-theme';

  const statusLabels = {
    pending: 'Gözləyir',
    assigned: 'Təyin edildi',
    teyin_edildi: 'Təyin edildi',
    goturuldu: 'Götürüldü',
    picked_up: 'Götürüldü',
    yoldadir: 'Yoldadır',
    approved: 'Kuryerdə',
    picked: 'Kuryerdə',
    onTheWay: 'Yoldadır',
    delivered: 'Çatdırıldı',
    cancelled: 'Ləğv edildi',
    legv_edildi: 'Ləğv edildi'
  };

  const statusClassMap = {
    pending: 'status-pending',
    assigned: 'status-kuryerde',
    teyin_edildi: 'status-kuryerde',
    goturuldu: 'status-kuryerde',
    picked_up: 'status-kuryerde',
    yoldadir: 'status-kuryerde',
    approved: 'status-kuryerde',
    picked: 'status-kuryerde',
    onTheWay: 'status-kuryerde',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled',
    legv_edildi: 'status-cancelled'
  };

  const isCancelledStatus = (status) => status === 'cancelled' || status === 'legv_edildi';
  const isAdminCancelled = (order) => isCancelledStatus(order?.status) && order?.cancelledBy === 'admin';
  const shouldCountInStoreDebt = (order) => {
    return Boolean(order) && !isAdminCancelled(order);
  };

  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTodayString = () => formatDateLocal(new Date());

  const getYesterdayString = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDateLocal(yesterday);
  };

  const isSameDay = (dateA, dateB) =>
    dateA.getDate() === dateB.getDate() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getFullYear() === dateB.getFullYear();

  const isOrderForDate = (order, dateString) => {
    if (!order.createdAt) return false;
    const orderDate = new Date(order.createdAt);
    return formatDateLocal(orderDate) === dateString;
  };

  const isOrderInRange = (order, from, to) => {
    if (!order.createdAt) return false;
    const orderDay = formatDateLocal(new Date(order.createdAt));

    if (from && orderDay < from) {
      return false;
    }
    if (to && orderDay > to) {
      return false;
    }
    return true;
  };

  const renderStatusBadge = (status) => {
    const className = statusClassMap[status] || 'status-default';
    return (
      <span className={`status-badge ${className}`}>
        {statusLabels[status] || status}
      </span>
    );
  };
  const getOrderIdValue = (order) => String(order?.id ?? order?._id ?? '');
  const formatCompactDate = (dateValue) => {
    if (!dateValue) {
      return 'N/A';
    }

    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) {
      return 'N/A';
    }

    return parsedDate.toLocaleDateString('az-AZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  const formatCompactId = (value) => {
    const stringValue = String(value || '');
    if (!stringValue) {
      return 'N/A';
    }

    return `#${stringValue.length > 8 ? stringValue.slice(-8) : stringValue}`;
  };
  const formatAmount = (value) => `${(parseFloat(value) || 0).toFixed(2)} ₼`;

  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    time: '',
    deliveryType: 'metro',
    metroName: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState('');
  const [receiptOpenErrors, setReceiptOpenErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [expandedPaymentId, setExpandedPaymentId] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem(themeStorageKey) === 'dark');
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    note: '',
    file: null
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentFileInputKey, setPaymentFileInputKey] = useState(Date.now());
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [filterMode, setFilterMode] = useState('today');
  const [filterDateFrom, setFilterDateFrom] = useState(getTodayString());
  const [filterDateTo, setFilterDateTo] = useState(getTodayString());

  const bakuMetros = [
    '28 May',
    'Gənclik',
    'Nərimanov',
    'Elmlər Akademiyası',
    'İnşaatçılar',
    '20 Yanvar',
    'Memar Əcəmi',
    'Nəsimi',
    'Azadlıq prospekti',
    'Dərnəgül',
    'Koroğlu',
    'Qara Qarayev',
    'Neftçilər',
    'Xalqlar Dostluğu',
    'Əhmədli',
    'Həzi Aslanov',
    'Nizami',
    'Ulduz',
    'Xətai',
    '8 Noyabr',
    'Xocasən',
    'Bakmil',
    'Sahil',
    'İçərişəhər',
    'Avtovağzal'
  ];

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/store/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedOrders = response.data?.orders || (Array.isArray(response.data) ? response.data : []);
      setOrders(fetchedOrders);
    } catch (err) {
      setError(err.response?.data?.error || 'Sifarişlər alınarkən xəta baş verdi');
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadPayments = async () => {
    setPaymentsLoading(true);
    setPaymentsError('');
    try {
      const response = await axios.get(`/api/payments/store/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(response.data.payments || []);
      if (response.data?.summary) {
        setPaymentSummary({
          totalAmount: Number(response.data.summary.totalAmount || 0),
          totalPaid: Number(response.data.summary.totalPaid || 0),
          remainingAmount: Number(response.data.summary.remainingAmount || 0)
        });
      } else {
        setPaymentSummary(null);
      }
    } catch (err) {
      setPaymentsError(err.response?.data?.error || 'Ödənişlər alınarkən xəta baş verdi');
      setPaymentSummary(null);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    loadPayments();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadPayments();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem(themeStorageKey, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1100) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filterOrders = (ordersToFilter) => {
    if (filterMode === 'today') {
      return ordersToFilter.filter((order) => isOrderForDate(order, getTodayString()));
    }
    if (filterMode === 'yesterday') {
      return ordersToFilter.filter((order) => isOrderForDate(order, getYesterdayString()));
    }
    if (filterMode === 'range' && (filterDateFrom || filterDateTo)) {
      return ordersToFilter.filter((order) => isOrderInRange(order, filterDateFrom, filterDateTo));
    }
    return ordersToFilter;
  };

  const filteredOrders = filterOrders(orders);
  const todayOrders = orders.filter((order) => isOrderForDate(order, getTodayString()));
  const todayAmount = todayOrders
    .filter(shouldCountInStoreDebt)
    .reduce((sum, order) => sum + (parseFloat(order.price) || 0), 0);
  const fallbackTotalAmount = orders
    .filter(shouldCountInStoreDebt)
    .reduce((sum, order) => sum + (parseFloat(order.price) || 0), 0);
  const fallbackTotalPaid = payments
    .filter((payment) => payment?.status === 'approved')
    .reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
  const totalAmount = Number.isFinite(Number(paymentSummary?.totalAmount))
    ? Number(paymentSummary.totalAmount)
    : fallbackTotalAmount;
  const totalPaid = Number.isFinite(Number(paymentSummary?.totalPaid))
    ? Number(paymentSummary.totalPaid)
    : fallbackTotalPaid;
  const pendingPaymentsCount = payments.filter((payment) => payment?.status === 'pending').length;
  const debt = Number((totalAmount - totalPaid).toFixed(2));
  const remainingDebt = Number.isFinite(Number(paymentSummary?.remainingAmount))
    ? Number(paymentSummary.remainingAmount)
    : Math.max(debt, 0);
  const unpaidOrders = orders.filter(shouldCountInStoreDebt);
  const deliveredOrdersCount = orders.filter((order) => order?.status === 'delivered').length;
  const cancelledOrdersCount = orders.filter((order) => isCancelledStatus(order?.status)).length;
  const storeNavItems = [
    { id: 'orders', label: 'Sifarişlər', icon: '▤', meta: `${filteredOrders.length}` },
    { id: 'payments', label: 'Ödənişlər', icon: '◎', meta: `${payments.length}` }
  ];

  const handleTodayFilter = () => {
    setFilterMode('today');
    setFilterDateFrom(getTodayString());
    setFilterDateTo(getTodayString());
  };

  const handleYesterdayFilter = () => {
    const yesterday = getYesterdayString();
    setFilterMode('yesterday');
    setFilterDateFrom(yesterday);
    setFilterDateTo(yesterday);
  };

  const handleFilterDateFrom = (e) => {
    setFilterMode('range');
    setFilterDateFrom(e.target.value);
  };

  const handleFilterDateTo = (e) => {
    setFilterMode('range');
    setFilterDateTo(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`/api/orders`, orderForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Sifariş uğurla göndərildi');
      toast.success('Yeni sifariş yaradıldı');
      const createdOrder = response.data?.order;
      if (createdOrder) {
        setOrders((prev) => [createdOrder, ...prev]);
      }
      setOrderForm({
        customerName: '',
        customerPhone: '',
        time: '',
        deliveryType: 'metro',
        metroName: '',
        address: ''
      });
      // Keep default view focused on today's orders after creating a new one.
      setFilterMode('today');
      setFilterDateFrom(getTodayString());
      setFilterDateTo(getTodayString());
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.error || 'Sifariş göndərilərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getPaymentReceiptUrl = (payment) => {
    const rawUrl = payment?.receiptUrl || payment?.file || payment?.receipt || payment?.image || payment?.receipt?.receiptUrl || '';
    if (!rawUrl) {
      return '';
    }

    if (/^(data:|blob:|https?:)/i.test(rawUrl)) {
      return rawUrl;
    }

    return `${API_BASE_URL}/uploads/${rawUrl}`;
  };

  const getPaymentReceiptKey = (payment) => String(payment?.id || payment?.createdAt || 'unknown');

  const isImageReceiptUrl = (receiptUrl) => {
    if (!receiptUrl || typeof receiptUrl !== 'string') {
      return false;
    }

    if (/^data:image\//i.test(receiptUrl)) {
      return true;
    }

    return /\.(jpeg|jpg|png|gif)$/i.test(receiptUrl.split('?')[0]);
  };

  const openReceiptInNewTab = async (payment) => {
    const receiptUrl = getPaymentReceiptUrl(payment);
    const errorKey = getPaymentReceiptKey(payment);

    if (!receiptUrl) {
      setReceiptOpenErrors((prev) => ({ ...prev, [errorKey]: 'Fayl açıla bilmədi' }));
      return;
    }

    setReceiptOpenErrors((prev) => ({ ...prev, [errorKey]: '' }));

    try {
      if (!/^data:/i.test(receiptUrl)) {
        const response = await fetch(receiptUrl, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error('Receipt file is not reachable');
        }
      }

      window.open(receiptUrl, '_blank');
    } catch (error) {
      setReceiptOpenErrors((prev) => ({ ...prev, [errorKey]: 'Fayl açıla bilmədi' }));
    }
  };

  const openImageZoom = (imageUrl) => {
    if (!imageUrl) {
      return;
    }

    setSelectedImage(imageUrl);
  };

  const getPaymentStatusLabel = (status) => {
    if (status === 'approved') {
      return 'Təsdiq edildi';
    }
    if (status === 'cancelled') {
      return 'Ləğv edildi';
    }
    return 'Təsdiq gözləyir';
  };

  const getPaymentStatusClass = (status) => {
    if (status === 'approved') {
      return 'status-delivered';
    }
    if (status === 'cancelled') {
      return 'status-cancelled';
    }
    return 'status-pending';
  };
  const renderPaymentStatusBadge = (status) => (
    <span className={`status-badge ${getPaymentStatusClass(status)}`}>
      {getPaymentStatusLabel(status)}
    </span>
  );

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentFileChange = (e) => {
    const file = e.target.files[0] || null;
    setPaymentForm((prev) => ({ ...prev, file }));
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentsError('');
    setPaymentSuccess('');

    setPaymentLoading(true);

    if (!paymentForm.amount) {
      setPaymentsError('Məbləğ tələb olunur');
      setPaymentLoading(false);
      return;
    }

    const amountValue = Number(paymentForm.amount);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      setPaymentsError('Məbləğ düzgün formatda olmalıdır');
      setPaymentLoading(false);
      return;
    }

    try {
      const payload = {
        amount: amountValue,
        note: paymentForm.note || null,
        file: null,
        receipt: null
      };

      if (paymentForm.file) {
        payload.receipt = {
          receiptUrl: await readFileAsDataURL(paymentForm.file),
          originalName: paymentForm.file.name || null,
          mimeType: paymentForm.file.type || null
        };
      }

      await axios.post(`/api/payments`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPaymentSuccess('Təsdiq gözləyir');
      setPaymentForm({ amount: '', note: '', file: null });
      setPaymentFileInputKey(Date.now());
      await loadPayments();
    } catch (err) {
      setPaymentsError(err.response?.data?.error || 'Ödəniş göndərilərkən xəta baş verdi');
    } finally {
      setPaymentLoading(false);
    }
  };

  const renderOrdersList = (ordersToRender, emptyMessage) => {
    const sortedOrders = ordersToRender
      .slice()
      .sort((firstOrder, secondOrder) => new Date(secondOrder?.createdAt || 0) - new Date(firstOrder?.createdAt || 0));

    if (sortedOrders.length === 0) {
      return <div className="order-status">{emptyMessage}</div>;
    }

    return (
      <div className="store-list-shell">
        <div className="store-list-header store-list-row store-list-row-orders">
          <span>ID</span>
          <span>Status</span>
          <span>Məbləğ</span>
          <span>Tarix</span>
        </div>
        {sortedOrders.map((order) => {
          const orderId = getOrderIdValue(order);
          const isExpanded = expandedOrderId === orderId;

          return (
            <React.Fragment key={orderId}>
              <button
                type="button"
                className={`store-list-row store-list-row-button store-list-row-orders ${isExpanded ? 'is-expanded' : ''}`}
                onClick={() => setExpandedOrderId((currentValue) => (currentValue === orderId ? null : orderId))}
              >
                <span className="store-list-primary">{formatCompactId(orderId)}</span>
                <span>{renderStatusBadge(order.status)}</span>
                <span className="store-list-amount">{formatAmount(order.price)}</span>
                <span>{formatCompactDate(order.createdAt)}</span>
              </button>
              {isExpanded && (
                <div className="store-list-expand">
                  <div className="store-list-expand-grid">
                    <div className="store-list-detail-item">
                      <span className="store-list-detail-label">Müştəri</span>
                      <span>{order.customerName || 'N/A'}</span>
                    </div>
                    <div className="store-list-detail-item">
                      <span className="store-list-detail-label">Telefon</span>
                      <span>{order.phone || order.customerPhone || 'N/A'}</span>
                    </div>
                    <div className="store-list-detail-item">
                      <span className="store-list-detail-label">Vaxt</span>
                      <span>{order.time || 'N/A'}</span>
                    </div>
                    <div className="store-list-detail-item">
                      <span className="store-list-detail-label">Çatdırılma</span>
                      <span>{order.deliveryType === 'metro' ? 'Metro daxili' : 'Metro xarici'}</span>
                    </div>
                    <div className="store-list-detail-item">
                      <span className="store-list-detail-label">Metro / Ünvan</span>
                      <span>{order.deliveryType === 'metro' ? order.metroName || 'N/A' : order.address || 'N/A'}</span>
                    </div>
                    <div className="store-list-detail-item">
                      <span className="store-list-detail-label">Tarix</span>
                      <span>{formatCompactDate(order.createdAt)}</span>
                    </div>
                    {isCancelledStatus(order.status) && (
                      <div className="store-list-detail-item">
                        <span className="store-list-detail-label">Kim ləğv etdi</span>
                        <span>{order.cancelledBy || 'Naməlum'}</span>
                      </div>
                    )}
                    {isCancelledStatus(order.status) && (
                      <div className="store-list-detail-item store-list-detail-wide">
                        <span className="store-list-detail-label">Ləğv səbəbi</span>
                        <span>{order.cancelReason || 'Yoxdur'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderPaymentsList = (paymentsToRender) => {
    const sortedPayments = paymentsToRender
      .slice()
      .sort((firstPayment, secondPayment) => new Date(secondPayment?.createdAt || 0) - new Date(firstPayment?.createdAt || 0));

    if (sortedPayments.length === 0) {
      return <div className="order-status">Heç bir ödəniş yoxdur.</div>;
    }

    return (
      <div className="store-list-shell">
        <div className="store-list-header store-list-row store-list-row-payments">
          <span>Məbləğ</span>
          <span>Status</span>
          <span>Tarix</span>
        </div>
        {sortedPayments.map((payment) => {
          const paymentId = getPaymentReceiptKey(payment);
          const isExpanded = expandedPaymentId === paymentId;
          const receiptUrl = getPaymentReceiptUrl(payment);

          return (
            <React.Fragment key={paymentId}>
              <button
                type="button"
                className={`store-list-row store-list-row-button store-list-row-payments ${isExpanded ? 'is-expanded' : ''}`}
                onClick={() => setExpandedPaymentId((currentValue) => (currentValue === paymentId ? null : paymentId))}
              >
                <span className="store-list-amount">{formatAmount(payment.amount)}</span>
                <span>{renderPaymentStatusBadge(payment?.status)}</span>
                <span>{formatCompactDate(payment.createdAt)}</span>
              </button>
              {isExpanded && (
                <div className="store-list-expand">
                  <div className="store-list-expand-grid">
                    <div className="store-list-detail-item">
                      <span className="store-list-detail-label">Status</span>
                      <span>{getPaymentStatusLabel(payment?.status)}</span>
                    </div>
                    <div className="store-list-detail-item">
                      <span className="store-list-detail-label">Qeyd</span>
                      <span>{payment.note || 'Yoxdur'}</span>
                    </div>
                    <div className="store-list-detail-item">
                      <span className="store-list-detail-label">Tarix</span>
                      <span>{formatCompactDate(payment.createdAt)}</span>
                    </div>
                    <div className="store-list-detail-item">
                      <span className="store-list-detail-label">Qəbz</span>
                      <span>
                        {receiptUrl ? (
                          isImageReceiptUrl(receiptUrl) ? (
                            <img
                              src={receiptUrl}
                              alt="Qəbz önizləmə"
                              className="store-list-receipt-thumb"
                              onClick={(event) => {
                                event.stopPropagation();
                                openImageZoom(receiptUrl);
                              }}
                              onError={() => {
                                setReceiptOpenErrors((prev) => ({ ...prev, [paymentId]: 'Fayl açıla bilmədi' }));
                              }}
                            />
                          ) : (
                            <button
                              type="button"
                              className="view-order-button"
                              onClick={() => openReceiptInNewTab(payment)}
                            >
                              Qəbzi aç
                            </button>
                          )
                        ) : 'Yoxdur'}
                      </span>
                    </div>
                  </div>
                  {receiptOpenErrors[paymentId] && (
                    <div className="error-message">{receiptOpenErrors[paymentId]}</div>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`dashboard store-dashboard app-shell-page ${isDarkMode ? 'app-dark-theme' : ''}`}>
      <div className={`app-shell-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <aside className="app-shell-sidebar">
          <div className="app-shell-brand">
            <span className="app-shell-brand-mark">S</span>
            <div>
              <strong>Kargo System</strong>
              <span>Store Workspace</span>
            </div>
          </div>

          <nav className="app-shell-nav">
            {storeNavItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`app-shell-nav-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
              >
                <span className="app-shell-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                <span className="app-shell-nav-meta">{item.meta}</span>
              </button>
            ))}
          </nav>

          <div className="app-shell-sidebar-card">
            <span className="app-shell-sidebar-label">Bugünkü axın</span>
            <strong>{todayOrders.length} sifariş</strong>
            <p>{todayAmount.toFixed(2)} ₼ dövriyyə</p>
          </div>

          <div className="app-shell-sidebar-card">
            <span className="app-shell-sidebar-label">Hesab vəziyyəti</span>
            <strong>{remainingDebt.toFixed(2)} ₼</strong>
            <p>Qalan balans</p>
          </div>
        </aside>

        <button
          type="button"
          className={`app-shell-sidebar-overlay ${isSidebarOpen ? 'is-visible' : ''}`}
          aria-label="Menyunu bağla"
          onClick={() => setIsSidebarOpen(false)}
        />

        <div className="app-shell-main">
          <div className="app-shell-topbar">
            <div>
              <button
                type="button"
                className="app-shell-menu-toggle"
                aria-label={isSidebarOpen ? 'Menyunu bağla' : 'Menyunu aç'}
                aria-expanded={isSidebarOpen}
                onClick={() => setIsSidebarOpen((currentValue) => !currentValue)}
              >
                <span>{isSidebarOpen ? '✕' : '☰'}</span>
                <span>Menu</span>
              </button>
              <p className="app-shell-eyebrow">Store panel</p>
              <h1>{activeTab === 'orders' ? 'Sifariş İdarəetməsi' : 'Ödəniş İdarəetməsi'}</h1>
            </div>
            <div className="app-shell-topbar-actions">
              <button
                type="button"
                className="app-theme-toggle"
                onClick={() => setIsDarkMode((currentValue) => !currentValue)}
              >
                <span>{isDarkMode ? '☀' : '☾'}</span>
                <span>{isDarkMode ? 'Light' : 'Dark'}</span>
              </button>
              <div className="app-shell-user-pill">
                <span className="app-shell-user-avatar">S</span>
                <div>
                  <strong>{user.name}</strong>
                  <span>Mağaza</span>
                </div>
              </div>
              <button className="logout-button" onClick={handleLogout}>
                Çıxış
              </button>
            </div>
          </div>

          <div className="dashboard-content app-shell-content">
            <div className="welcome-card app-shell-hero-card">
              <div>
                <h2>Xoş gəldiniz, {user.name}!</h2>
                <p>Mağaza panelində yeni sifariş yarada, ödəniş göndərə və bütün axını daha təmiz bir interfeysdə izləyə bilərsiniz.</p>
              </div>
              <div className="app-shell-hero-meta">
                <span>ID: {user.id}</span>
                <span>Rol: Mağaza</span>
              </div>
            </div>

            {activeTab === 'orders' ? (
              <>
                <div className="stats-container premium-stats-grid">
                  <div className="stats-card premium-card">
                <h3>Bu gün bağlama sayı</h3>
                <p className="stats-value">{todayOrders.length}</p>
                  </div>
                  <div className="stats-card premium-card">
                <h3>Bu gün məbləğ (₼)</h3>
                <p className="stats-value">{todayAmount.toFixed(2)}</p>
                  </div>
                  <div className="stats-card premium-card">
                <h3>Ümumi bağlama sayı</h3>
                <p className="stats-value">{orders.length}</p>
                  </div>
                  <div className="stats-card premium-card">
                <h3>Ümumi məbləğ (₼)</h3>
                <p className="stats-value">{totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="stats-card premium-card">
                    <h3>Çatdırılan sifarişlər</h3>
                    <p className="stats-value">{deliveredOrdersCount}</p>
                  </div>
                  <div className="stats-card premium-card">
                    <h3>Ləğv olunan sifarişlər</h3>
                    <p className="stats-value">{cancelledOrdersCount}</p>
                  </div>
                  <div className={`stats-card payable-card premium-card ${debt <= 0 ? 'debt-zero' : 'debt-positive'}`}>
                <h3>Borcdur (₼)</h3>
                <p className="stats-value">{debt.toFixed(2)}</p>
                <p className="debt-note">Ödənilib: {totalPaid.toFixed(2)} ₼</p>
                  </div>
                </div>

                <div className="filters-section app-panel-card">
              <div className="filter-buttons">
                <button
                  type="button"
                  className={`filter-button ${filterMode === 'today' ? 'active' : ''}`}
                  onClick={handleTodayFilter}
                >
                  Bu gün
                </button>
                <button
                  type="button"
                  className={`filter-button ${filterMode === 'yesterday' ? 'active' : ''}`}
                  onClick={handleYesterdayFilter}
                >
                  Dünən
                </button>
              </div>
              <div className="filter-row">
                <div className="filter-group">
                  <label htmlFor="filterDateFrom">Başlanğıc tarix</label>
                  <input
                    id="filterDateFrom"
                    type="date"
                    value={filterDateFrom}
                    onChange={handleFilterDateFrom}
                    className="filter-input"
                  />
                </div>
                <div className="filter-group">
                  <label htmlFor="filterDateTo">Bitiş tarix</label>
                  <input
                    id="filterDateTo"
                    type="date"
                    value={filterDateTo}
                    onChange={handleFilterDateTo}
                    className="filter-input"
                  />
                </div>
              </div>
            </div>

                <div className="store-section-card store-form-card app-panel-card">
              <div className="section-header">
                <div>
                  <h2>Yeni Sifariş Yarat</h2>
                  <p className="section-note">Sifariş məlumatlarını qısa və aydın şəkildə daxil edin.</p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="store-clean-form">
                <div className="store-form-grid">
                  <div className="form-group">
                    <label htmlFor="customerName">Müştəri adı</label>
                    <input
                      id="customerName"
                      name="customerName"
                      value={orderForm.customerName}
                      onChange={handleChange}
                      placeholder="Müştəri adını daxil edin"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="customerPhone">Müştəri telefonu</label>
                    <input
                      id="customerPhone"
                      name="customerPhone"
                      type="tel"
                      value={orderForm.customerPhone}
                      onChange={handleChange}
                      placeholder="+994..."
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="time">Vaxt</label>
                    <input
                      id="time"
                      name="time"
                      type="time"
                      min="00:00"
                      max="23:59"
                      step="60"
                      value={orderForm.time}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="deliveryType">Çatdırılma növü</label>
                    <select
                      id="deliveryType"
                      name="deliveryType"
                      value={orderForm.deliveryType}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="metro">Metro daxili</option>
                      <option value="outside">Metro xarici</option>
                    </select>
                  </div>
                </div>

                {orderForm.deliveryType === 'metro' && (
                  <div className="form-group">
                    <label htmlFor="metroName">Metro adı</label>
                    <select
                      id="metroName"
                      name="metroName"
                      value={orderForm.metroName}
                      onChange={handleChange}
                      required
                      className="form-input"
                    >
                      <option value="">Metro seçin</option>
                      {bakuMetros.map((metro) => (
                        <option key={metro} value={metro}>
                          {metro}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {orderForm.deliveryType === 'outside' && (
                  <div className="form-group">
                    <label htmlFor="address">Ünvan</label>
                    <input
                      id="address"
                      name="address"
                      value={orderForm.address}
                      onChange={handleChange}
                      placeholder="Ünvanı daxil edin"
                      required
                      className="form-input"
                    />
                  </div>
                )}

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <button className="submit-button" type="submit" disabled={loading}>
                  {loading ? 'Yüklənir...' : 'Sifarişi göndər'}
                </button>
              </form>
            </div>

                <div className="store-section-card app-panel-card">
              <div className="section-header">
                <div>
                  <h2>Mövcud Sifarişlər</h2>
                  <p className="section-note">Sətirə klik edərək tam detallara baxın.</p>
                </div>
              </div>
              {ordersLoading ? (
                <div className="order-status">Sifarişlər yüklənir...</div>
              ) : (
                renderOrdersList(filteredOrders, 'Heç bir sifariş yoxdur.')
              )}
            </div>
              </>
            ) : (
              <div className="payments-page">
                <div className="summary-grid premium-stats-grid">
                  <div className="stats-card premium-card">
            <h3>Ümumi borc (₼)</h3>
            <p className="stats-value">{totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="stats-card premium-card">
            <h3>Ödənilib (₼)</h3>
            <p className="stats-value">{totalPaid.toFixed(2)}</p>
                  </div>
                  <div className={`stats-card payable-card premium-card ${remainingDebt <= 0 ? 'debt-zero' : 'debt-positive'}`}>
            <h3>Qalan borc (₼)</h3>
            <p className="stats-value">{remainingDebt.toFixed(2)}</p>
                  </div>
                </div>

                <div className="payment-form-card store-section-card app-panel-card">
          <div className="section-header">
            <div>
              <h2>Ödəniş et</h2>
              <p className="section-note">Ödəniş göndərildikdən sonra admin təsdiqi gözlənilir.</p>
            </div>
          </div>
          {pendingPaymentsCount > 0 && (
            <div className="store-warning-banner">Ödəniş təsdiq gözləyir{pendingPaymentsCount > 1 ? ` (${pendingPaymentsCount})` : ''}</div>
          )}
          <form onSubmit={handlePaymentSubmit} className="store-clean-form">
            <div className="form-group">
              <label htmlFor="paymentAmount">Məbləğ (₼)</label>
              <input
                id="paymentAmount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={paymentForm.amount}
                onChange={handlePaymentChange}
                required
                className="form-input"
                placeholder="Məbləğ daxil edin"
              />
            </div>
            <div className="form-group">
              <label htmlFor="paymentNote">Qeyd</label>
              <textarea
                id="paymentNote"
                name="note"
                value={paymentForm.note}
                onChange={handlePaymentChange}
                className="form-input"
                placeholder="Payment haqqında qeyd"
              />
            </div>
            <div className="form-group">
              <label htmlFor="paymentFile">Fayl / şəkil</label>
              <input
                key={paymentFileInputKey}
                id="paymentFile"
                name="file"
                type="file"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                onChange={handlePaymentFileChange}
                className="form-input"
              />
            </div>

            {paymentsError && <div className="error-message">{paymentsError}</div>}
            {paymentSuccess && <div className="success-message">{paymentSuccess}</div>}

            <button className="submit-button" type="submit" disabled={paymentLoading}>
              {paymentLoading ? 'Yüklənir...' : 'Ödəniş etdim'}
            </button>
          </form>
        </div>

                <div className="payments-list premium-two-column">
                  <div className="payments-section store-section-card app-panel-card">
            <div className="section-header">
              <div>
                <h2>Bütün ödənişlər</h2>
                <p className="section-note">Sətirə klik edərək qeyd və qəbz detallarını açın.</p>
              </div>
            </div>
            {paymentsLoading ? (
              <div className="order-status">Ödənişlər yüklənir...</div>
            ) : payments.length === 0 ? (
              <div className="order-status">Heç bir ödəniş yoxdur.</div>
            ) : (
              renderPaymentsList(payments)
            )}
          </div>

                  <div className="payments-section store-section-card app-panel-card">
            <div className="section-header">
              <h2>Ödənilməli sifarişlər</h2>
              <p className="section-note">Cəmi məbləğ: {totalAmount.toFixed(2)} ₼</p>
            </div>
            {ordersLoading ? (
              <div className="order-status">Sifarişlər yüklənir...</div>
            ) : unpaidOrders.length === 0 ? (
              <div className="order-status">Heç bir ödənilməli sifariş yoxdur.</div>
            ) : (
              renderOrdersList(unpaidOrders, 'Heç bir ödənilməli sifariş yoxdur.')
            )}
          </div>
                </div>
              </div>
            )}

            {selectedImage && (
              <div className="image-zoom-modal" onClick={() => setSelectedImage(null)}>
                <div className="image-zoom-content" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="close-button image-zoom-close"
                    onClick={() => setSelectedImage(null)}
                  >
                    ×
                  </button>
                  <img src={selectedImage} alt="Qəbz tam görünüş" className="image-zoom-image" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreDashboard;
