import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const statusLabels = {
  pending: 'Gözləyir',
  assigned: 'Təyin edildi',
  teyin_edildi: 'Təyin edildi',
  goturuldu: 'Götürüldü',
  picked_up: 'Götürüldü',
  kuryerde: 'Kuryerdə',
  yoldadir: 'Yoldadır',
  approved: 'Kuryerdə',
  picked: 'Kuryerdə',
  onTheWay: 'Yoldadır',
  delivered: 'Çatdırıldı',
  cancelled: 'Ləğv edildi',
  legv_edildi: 'Ləğv edildi',
  created: 'Yeni'
};

const statusClassMap = {
  pending: 'status-pending',
  assigned: 'status-kuryerde',
  teyin_edildi: 'status-kuryerde',
  goturuldu: 'status-kuryerde',
  picked_up: 'status-kuryerde',
  kuryerde: 'status-kuryerde',
  yoldadir: 'status-kuryerde',
  approved: 'status-kuryerde',
  picked: 'status-kuryerde',
  onTheWay: 'status-kuryerde',
  delivered: 'status-delivered',
  cancelled: 'status-cancelled',
  legv_edildi: 'status-cancelled',
  created: 'status-kuryerde'
};

function CourierDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const themeStorageKey = 'app-theme';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [filterTab, setFilterTab] = useState('mine');
  const [selectedStoreKey, setSelectedStoreKey] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem(themeStorageKey) === 'dark');
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const loadOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError('');

    try {
      const response = await axios.get('/api/courier/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Sifarişlər alınarkən xəta baş verdi');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => loadOrders(false), 5000);
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

  const getStatusActions = (status) => {
    // Returns array of { label, newStatus } for current status
    if (status === 'pending' || status === 'created' || status === 'teyin_edildi' || status === 'assigned') {
      return [{ label: 'Götürdüm', newStatus: 'picked' }];
    }
    if (status === 'approved' || status === 'picked' || status === 'picked_up' || status === 'kuryerde' || status === 'onTheWay' || status === 'goturuldu' || status === 'yoldadir') {
      return [
        { label: 'Çatdırıldı', newStatus: 'delivered' },
        { label: 'Ləğv edildi', newStatus: 'cancelled' }
      ];
    }
    return []; // No actions for delivered or cancelled
  };

  const handleUpdateStatus = async (orderId, newStatus, cancelReason = null) => {
    setUpdatingOrderId(orderId);
    setError('');

    try {
      const response = await axios.put(
        `/api/courier/orders/${orderId}/status`,
        { status: newStatus, cancelReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedOrder = response.data?.order;
      if (updatedOrder) {
        setOrders((currentOrders) => {
          const hasOrder = currentOrders.some(
            (currentOrder) => String(getOrderIdValue(currentOrder)) === String(orderId)
          );

          const nextOrders = currentOrders.map((currentOrder) => (
            String(getOrderIdValue(currentOrder)) === String(orderId)
              ? { ...currentOrder, ...updatedOrder }
              : currentOrder
          ));

          return hasOrder ? nextOrders : [updatedOrder, ...nextOrders];
        });
      }

      await loadOrders(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Status yenilənərkən xəta baş verdi');
    } finally {
      setUpdatingOrderId(null);
    }
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

  const formatCompactId = (value) => {
    const stringValue = String(value || '');
    if (!stringValue) {
      return 'N/A';
    }

    return `#${stringValue.length > 8 ? stringValue.slice(-8) : stringValue}`;
  };

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

  const getShortAddress = (order) => {
    const addressText = order.address || order.metro || order.metroName || order.storeAddress || 'Ünvan yoxdur';
    return addressText.length > 32 ? `${addressText.slice(0, 32)}...` : addressText;
  };

  const getFullAddress = (order) => {
    if (order.deliveryType === 'metro' && (order.metro || order.metroName)) {
      return `Metro: ${order.metro || order.metroName}`;
    }
    return order.address || order.storeAddress || 'Ünvan yoxdur';
  };

  const isCurrentCourierOrder = (order) => String(order?.courierId) === String(user.id);
  const isActiveCourierOrder = (order) => {
    const normalizedStatus = String(order?.status || '').toLowerCase();
    return normalizedStatus === 'active' || normalizedStatus === 'assigned';
  };

  const getVisibleOrders = () => {
    const sortedOrders = orders
      .slice()
      .sort((firstOrder, secondOrder) => new Date(secondOrder.updatedAt || secondOrder.createdAt) - new Date(firstOrder.updatedAt || firstOrder.createdAt));

    const myOrders = sortedOrders.filter(isCurrentCourierOrder);

    if (filterTab === 'mine') {
      return myOrders;
    }

    if (filterTab === 'delivered') {
      return myOrders.filter((order) => order.status === 'delivered');
    }

    if (filterTab === 'undelivered') {
      return myOrders.filter(isActiveCourierOrder);
    }

    return myOrders;
  };

  const visibleOrders = getVisibleOrders().filter((order) => {
    if (!selectedStoreKey) {
      return true;
    }

    const storeKey = String(order?.storeId ?? order?.storeName ?? 'unknown');
    return storeKey === selectedStoreKey;
  });

  const pendingStoreOrders = orders.filter((order) => order?.status === 'pending');

  const groupedStores = pendingStoreOrders.reduce((accumulator, order) => {
    const storeKey = String(order?.storeId ?? order?.storeName ?? 'unknown');
    if (!accumulator[storeKey]) {
      accumulator[storeKey] = {
        storeKey,
        storeName: order?.storeName || 'Naməlum mağaza',
        storeAddress: order?.storeAddress || 'Ünvan yoxdur',
        storePhone: order?.storePhone || 'Telefon yoxdur',
        orderCount: 0
      };
    }

    accumulator[storeKey].orderCount += 1;
    return accumulator;
  }, {});

  const storeGroups = Object.values(groupedStores).sort((firstStore, secondStore) => secondStore.orderCount - firstStore.orderCount);
  const deliveredOrdersCount = orders.filter((order) => order?.status === 'delivered').length;
  const activeOrdersCount = orders.filter((order) => isCurrentCourierOrder(order) && isActiveCourierOrder(order)).length;
  const mineOrdersCount = orders.filter(isCurrentCourierOrder).length;
  const cancelledOrdersCount = orders.filter((order) => order?.status === 'cancelled' || order?.status === 'legv_edildi').length;
  const courierNavItems = [
    { id: 'mine', label: 'Mənim sifarişlərim', icon: '◎', meta: `${mineOrdersCount}` },
    { id: 'delivered', label: 'Çatdırılanlar', icon: '✓', meta: `${deliveredOrdersCount}` },
    { id: 'undelivered', label: 'Aktiv sifarişlər', icon: '↠', meta: `${activeOrdersCount}` }
  ];

  useEffect(() => {
    if (!selectedStoreKey) {
      return;
    }

    const hasSelectedStore = storeGroups.some((store) => store.storeKey === selectedStoreKey);
    if (!hasSelectedStore) {
      setSelectedStoreKey('');
    }
  }, [selectedStoreKey, storeGroups]);

  const renderOrdersList = () => {
    if (visibleOrders.length === 0) {
      return <div className="order-status">Bu filtr üzrə sifariş yoxdur.</div>;
    }

    return (
      <div className="courier-list-shell">
        <div className="courier-list-header courier-list-row courier-list-row-orders">
          <span>ID</span>
          <span>Müştəri telefon</span>
          <span>Ünvan</span>
          <span>Saat</span>
          <span>Tarix</span>
          <span>Status</span>
        </div>
        {visibleOrders.map((order) => {
          const orderId = getOrderIdValue(order);
          const actions = getStatusActions(order.status);
          const isExpanded = expandedOrderId === orderId;
          const isAssignedToCurrentCourier = String(order?.courierId) === String(user.id);

          return (
            <React.Fragment key={orderId}>
              <button
                type="button"
                className={`courier-list-row courier-list-row-button courier-list-row-orders ${isExpanded ? 'is-expanded' : ''}`}
                onClick={() => setExpandedOrderId((currentValue) => (currentValue === orderId ? null : orderId))}
              >
                <span className="courier-list-primary">{formatCompactId(orderId)}</span>
                <span>{order.customerPhone || order.phone || 'N/A'}</span>
                <span>{getShortAddress(order)}</span>
                <span>{order.time || 'N/A'}</span>
                <span>{formatCompactDate(order.updatedAt || order.createdAt)}</span>
                <span>{renderStatusBadge(order.status)}</span>
              </button>
              {isExpanded && (
                <div className="courier-list-expand">
                  {isAssignedToCurrentCourier && <div className="courier-assigned-badge">Sənin sifarişin</div>}
                  <div className="courier-list-expand-grid">
                    <div className="courier-list-detail-item">
                      <span className="courier-list-detail-label">Müştəri telefon</span>
                      <span>{order.customerPhone || order.phone || 'N/A'}</span>
                    </div>
                    <div className="courier-list-detail-item">
                      <span className="courier-list-detail-label">Tam ünvan</span>
                      <span>{getFullAddress(order)}</span>
                    </div>
                    <div className="courier-list-detail-item">
                      <span className="courier-list-detail-label">Saat + tarix</span>
                      <span>{`${order.time || 'N/A'} • ${formatCompactDate(order.updatedAt || order.createdAt)}`}</span>
                    </div>
                    <div className="courier-list-detail-item">
                      <span className="courier-list-detail-label">Qeyd</span>
                      <span>{order.note || 'Yoxdur'}</span>
                    </div>
                    <div className="courier-list-detail-item">
                      <span className="courier-list-detail-label">Məbləğ</span>
                      <span>{(parseFloat(order.price) || 0).toFixed(2)} ₼</span>
                    </div>
                    <div className="courier-list-detail-item">
                      <span className="courier-list-detail-label">Mağaza adı</span>
                      <span>{order.storeName || 'N/A'}</span>
                    </div>
                    <div className="courier-list-detail-item">
                      <span className="courier-list-detail-label">Mağaza ünvanı</span>
                      <span>{order.storeAddress || 'Ünvan yoxdur'}</span>
                    </div>
                    <div className="courier-list-detail-item">
                      <span className="courier-list-detail-label">Mağaza telefon</span>
                      <span>{order.storePhone || 'Telefon yoxdur'}</span>
                    </div>
                  </div>
                  <div className="courier-actions">
                    {actions.length > 0 ? (
                      actions.map((action) => (
                        <button
                          key={action.newStatus}
                          className="order-button"
                          onClick={() => {
                            if (action.newStatus === 'delivered' && !window.confirm('Sifariş çatdırıldı?')) {
                              return;
                            }

                            if (action.newStatus === 'cancelled' && !window.confirm('Ləğv etmək istədiyinizə əminsiniz?')) {
                              return;
                            }

                            let cancelReason = null;
                            if (action.newStatus === 'cancelled') {
                              const reason = window.prompt('Ləğv səbəbini yazın');
                              if (!reason || !reason.trim()) {
                                return;
                              }
                              cancelReason = reason.trim();
                            }

                            handleUpdateStatus(order.id, action.newStatus, cancelReason);
                          }}
                          disabled={updatingOrderId === order.id}
                        >
                          {action.newStatus === 'picked' ? 'Götürdüm' : action.label}
                        </button>
                      ))
                    ) : (
                      <button className="order-button" disabled>
                        {order.status === 'delivered' ? 'Çatdırıldı' : 'Ləğv edildi'}
                      </button>
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

  return (
    <div className={`dashboard courier-dashboard app-shell-page ${isDarkMode ? 'app-dark-theme' : ''}`}>
      <div className={`app-shell-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <aside className="app-shell-sidebar">
          <div className="app-shell-brand">
            <span className="app-shell-brand-mark">C</span>
            <div>
              <strong>Kargo System</strong>
              <span>Courier Workspace</span>
            </div>
          </div>

          <nav className="app-shell-nav">
            {courierNavItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`app-shell-nav-link ${filterTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setFilterTab(item.id);
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
            <span className="app-shell-sidebar-label">Mağaza nöqtələri</span>
            <strong>{storeGroups.length}</strong>
            <p>Aktiv filtr mövcuddur</p>
          </div>

          <div className="app-shell-sidebar-card">
            <span className="app-shell-sidebar-label">Ləğv olunanlar</span>
            <strong>{cancelledOrdersCount}</strong>
            <p>Tarixçədə görünür</p>
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
              <p className="app-shell-eyebrow">Courier panel</p>
              <h1>Sifariş Workflow</h1>
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
                <span className="app-shell-user-avatar">C</span>
                <div>
                  <strong>{user.name}</strong>
                  <span>Kuryer</span>
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
                <p>Sifarişləri kompakt siyahıda açıb sürətli status əməliyyatları ilə idarə edə bilərsiniz.</p>
              </div>
              <div className="app-shell-hero-meta">
                <span>ID: {user.id}</span>
                <span>Rol: Kuryer</span>
              </div>
            </div>

            <div className="summary-grid premium-stats-grid courier-summary-grid">
              <div className="stats-card premium-card">
                <h3>Mənim sifarişlərim</h3>
                <p className="stats-value">{mineOrdersCount}</p>
              </div>
              <div className="stats-card premium-card">
                <h3>Aktiv sifarişlər</h3>
                <p className="stats-value">{activeOrdersCount}</p>
              </div>
              <div className="stats-card premium-card">
                <h3>Çatdırılanlar</h3>
                <p className="stats-value">{deliveredOrdersCount}</p>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
              <div className="order-status">Sifarişlər yüklənir...</div>
            ) : orders.length === 0 ? (
              <div className="order-status">Hal-hazırda təyin edilmiş sifariş yoxdur.</div>
            ) : (
              <>
                <div className="store-section-card courier-section-card app-panel-card">
              <div className="section-header">
                <div>
                  <h2>Mağazalar</h2>
                  <p className="section-note">Mağazaya klik edərək həmin nöqtəyə aid sifarişləri süzün.</p>
                </div>
                <button
                  type="button"
                  className={`view-order-button ${selectedStoreKey ? '' : 'is-active-filter'}`}
                  onClick={() => setSelectedStoreKey('')}
                >
                  Bütün mağazalar
                </button>
              </div>
              <div className="courier-store-grid">
                {storeGroups.length === 0 ? (
                  <div className="order-status">Götürülməyi gözləyən sifariş yoxdur.</div>
                ) : (
                  storeGroups.map((store) => (
                    <button
                      type="button"
                      key={store.storeKey}
                      className={`courier-store-card ${selectedStoreKey === store.storeKey ? 'is-selected' : ''}`}
                      onClick={() => setSelectedStoreKey((currentValue) => (currentValue === store.storeKey ? '' : store.storeKey))}
                    >
                      <span className="courier-store-name">{store.storeName}</span>
                      <span>{store.storeAddress}</span>
                      <span>{store.storePhone}</span>
                      <span className="courier-store-count">{store.orderCount} sifariş</span>
                    </button>
                  ))
                )}
              </div>
            </div>

                <div className="store-section-card courier-section-card app-panel-card">
              <div className="section-header">
                <div>
                  <h2>Sifarişlər</h2>
                  <p className="section-note">Sətirə klik edərək tam detalları və əməliyyat düymələrini açın.</p>
                </div>
              </div>
              {renderOrdersList()}
            </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourierDashboard;
