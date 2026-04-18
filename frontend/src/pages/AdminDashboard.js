import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';
import './AdminPanel.css';

function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';
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
  const isCourierCancelled = (order) => isCancelledStatus(order?.status) && order?.cancelledBy === 'courier';
  const isAdminCancelled = (order) => isCancelledStatus(order?.status) && order?.cancelledBy === 'admin';
  const isDeliveredOrder = (order) => order?.status === 'delivered';
  const getOrderFinancialAmount = (order) => parseFloat(order?.amount ?? order?.price) || 0;
  const shouldCountInStoreDebt = (order) => Boolean(order) && !isAdminCancelled(order);
  const isCountedInEarnings = (order) => {
    if (!order) {
      return false;
    }

    if (order?.status === 'delivered') {
      return order?.isCountedInEarnings !== false;
    }

    return isCourierCancelled(order);
  };
  const getCancelledByLabel = (order) => {
    if (order?.cancelledBy === 'admin') {
      return 'Admin tərəfindən ləğv edildi';
    }
    if (order?.cancelledBy === 'courier') {
      return 'Kuryer tərəfindən ləğv edildi';
    }
    return 'Naməlum';
  };

  const createDestructiveActionState = () => ({
    isOpen: false,
    step: 1,
    actionType: '',
    targetId: null,
    adminCode: '',
    reason: '',
    codeError: '',
    actionError: '',
    isSubmitting: false
  });

  const renderStatusBadge = (status) => {
    const className = statusClassMap[status] || 'status-default';
    return (
      <span className={`status-badge ${className}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getYesterdayString = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

  const monthNamesAz = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
    'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
  ];

  const isOrderToday = (order) => {
    if (!order.createdAt) return false;
    const created = new Date(order.createdAt);
    const today = new Date();
    return (
      created.getDate() === today.getDate() &&
      created.getMonth() === today.getMonth() &&
      created.getFullYear() === today.getFullYear()
    );
  };

  const [activeTab, setActiveTab] = useState('home');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem(themeStorageKey) || localStorage.getItem('admin-theme');
    return savedTheme === 'dark';
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState('');
  const [couriers, setCouriers] = useState([]);
  const [couriersLoading, setCouriersLoading] = useState(false);
  const [selectedCouriers, setSelectedCouriers] = useState({});
  const [allOrders, setAllOrders] = useState([]);
  const [allOrdersLoading, setAllOrdersLoading] = useState(false);
  const [allOrdersError, setAllOrdersError] = useState('');
  const [openOrderId, setOpenOrderId] = useState(null);
  const [openOrderOptions, setOpenOrderOptions] = useState({});
  const [expandedPaymentRowId, setExpandedPaymentRowId] = useState(null);
  const [expandedCourierId, setExpandedCourierId] = useState(null);
  const [expandedStoreId, setExpandedStoreId] = useState(null);
  const [stats, setStats] = useState({ totalEarnings: 0, totalOrders: 0, cancelledOrders: 0 });

  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState('');
  const [receiptOpenErrors, setReceiptOpenErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPaymentStoreId, setSelectedPaymentStoreId] = useState(null);
  const [receiptPayment, setReceiptPayment] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [destructiveAction, setDestructiveAction] = useState(createDestructiveActionState);

  const [paymentStoreFilter, setPaymentStoreFilter] = useState('');
  const [paymentDateFrom, setPaymentDateFrom] = useState('');
  const [paymentDateTo, setPaymentDateTo] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [paymentMinAmount, setPaymentMinAmount] = useState('');
  const [paymentMaxAmount, setPaymentMaxAmount] = useState('');
  const [reportFilterMode, setReportFilterMode] = useState('today');
  const [reportStartDate, setReportStartDate] = useState(getTodayString());
  const [reportEndDate, setReportEndDate] = useState(getTodayString());
  const [reportStoreFilter, setReportStoreFilter] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('');

  const courierReport = couriers.map((courier) => {
    const countedOrders = allOrders.filter(
      (order) => String(order.courierId) === String(courier.id) && isCountedInEarnings(order)
    );
    const orderCount = Number(courier?.orderCount ?? courier?.orders?.length ?? countedOrders.length ?? 0);
    return {
      ...courier,
      orderCount,
      totalEarnings: countedOrders.reduce((sum, order) => sum + (parseFloat(order.price) || 0), 0)
    };
  });

  const storeReport = stores.map((store) => {
    const storeOrders = allOrders.filter((order) => String(order.storeId) === String(store.id));
    const orderCount = Number(store?.orderCount ?? store?.orders?.length ?? storeOrders.length ?? 0);
    return {
      ...store,
      orderCount,
      totalEarnings: storeOrders
        .filter(isCountedInEarnings)
        .reduce((sum, order) => sum + (parseFloat(order.price) || 0), 0)
    };
  });

  const safeStores = Array.isArray(stores) ? stores : [];
  const safePayments = Array.isArray(payments) ? payments : [];
  const safeAllOrders = Array.isArray(allOrders) ? allOrders : [];

  const paymentsByStoreId = safePayments
    .filter((payment) => payment?.status === 'approved')
    .reduce((acc, payment) => {
      const storeId = String(payment?.storeId ?? '');
      if (!storeId) {
        return acc;
      }

      const amount = parseFloat(payment?.amount) || 0;
      acc[storeId] = (acc[storeId] || 0) + amount;
      return acc;
    }, {});

  const storePaymentSummary = safeStores.map((store) => {
    const storeOrders = safeAllOrders.filter((order) => String(order?.storeId) === String(store?.id));
    const totalOrders = storeOrders
      .filter(shouldCountInStoreDebt)
      .reduce((sum, order) => sum + (parseFloat(order.price) || 0), 0);
    const totalPaid = paymentsByStoreId[String(store?.id)] || 0;
    return {
      ...store,
      totalOrders,
      totalPaid,
      remaining: Number((totalOrders - totalPaid).toFixed(2))
    };
  });

  const selectedPaymentStore = safeStores.find((store) => String(store?.id) === String(selectedPaymentStoreId)) || null;
  const selectedStorePayments = safePayments.filter(
    (payment) => String(payment?.storeId ?? '') === String(selectedPaymentStoreId ?? '')
  );
  const filteredSelectedStorePayments = filterPayments(selectedStorePayments);
  const receiptStore = receiptPayment
    ? safeStores.find((store) => String(store?.id) === String(receiptPayment?.storeId))
    : null;
  const selectedStoreSummary = storePaymentSummary.find(
    (store) => String(store?.id) === String(selectedPaymentStoreId)
  ) || null;
  const selectedStoreOrders = safeAllOrders.filter(
    (order) => String(order?.storeId) === String(selectedPaymentStoreId)
  );
  const selectedStoreRemaining = Number(
    ((selectedStoreOrders
      .filter(shouldCountInStoreDebt)
      .reduce((sum, order) => sum + (parseFloat(order.price) || 0), 0)) -
      (paymentsByStoreId[String(selectedPaymentStoreId)] || 0)).toFixed(2)
  );
  const openOrder = openOrderId
    ? pendingOrders.find((order) => String(order?.id ?? order?._id) === String(openOrderId))
      || safeAllOrders.find((order) => String(order?.id ?? order?._id) === String(openOrderId))
      || null
    : null;

  const [selectedStore, setSelectedStore] = useState('');
  const [dateFrom, setDateFrom] = useState(getTodayString());
  const [dateTo, setDateTo] = useState(getTodayString());
  const [todayTotal, setTodayTotal] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    title: '',
    date: getTodayString()
  });
  const [expenseError, setExpenseError] = useState('');
  const [expenseLoading, setExpenseLoading] = useState(false);

  const [storeForm, setStoreForm] = useState({
    name: '',
    code: '',
    phone: '',
    address: '',
    metroPrice: '',
    outsidePrice: ''
  });
  const [storeError, setStoreError] = useState('');
  const [storeLoading, setStoreLoading] = useState(false);

  const [courierForm, setCourierForm] = useState({
    name: '',
    code: '',
    phone: ''
  });
  const [courierError, setCourierError] = useState('');
  const [courierLoading, setCourierLoading] = useState(false);

  useEffect(() => {
    const nextTheme = isDarkMode ? 'dark' : 'light';
    localStorage.setItem(themeStorageKey, nextTheme);
    localStorage.setItem('admin-theme', nextTheme);
  }, [isDarkMode]);

  const getDestructiveActionConfig = (actionType) => {
    const baseConfig = {
      firstPrompt: 'Silmək istədiyinizə əminsiniz?',
      secondPrompt: 'Bu əməliyyat geri qaytarılmır!',
      codePrompt: 'Zəhmət olmasa admin kodunu daxil edin',
      successMessage: 'Uğurla silindi',
      finalButtonLabel: 'Silməni təsdiqlə',
      title: 'Təhlükəsiz təsdiq'
    };

    if (actionType === 'delete-courier') {
      return { ...baseConfig, title: 'Kuryeri sil' };
    }

    if (actionType === 'delete-store') {
      return { ...baseConfig, title: 'Mağazanı sil' };
    }

    if (actionType === 'delete-expense') {
      return { ...baseConfig, title: 'Xərci sil' };
    }

    if (actionType === 'cancel-payment') {
      return {
        ...baseConfig,
        title: 'Ödənişi ləğv et',
        finalButtonLabel: 'Ləğvi təsdiqlə'
      };
    }

    if (actionType === 'cancel-order') {
      return {
        ...baseConfig,
        title: 'Sifarişi ləğv et',
        finalButtonLabel: 'Ləğvi təsdiqlə',
        requiresReason: true
      };
    }

    return baseConfig;
  };

  const closeDestructiveActionModal = () => {
    setDestructiveAction(createDestructiveActionState());
  };

  const openDestructiveActionModal = (actionType, targetId) => {
    setDestructiveAction({
      ...createDestructiveActionState(),
      isOpen: true,
      actionType,
      targetId
    });
  };

  const advanceDestructiveActionStep = () => {
    setDestructiveAction((prev) => ({
      ...prev,
      step: prev.step + 1,
      codeError: '',
      actionError: ''
    }));
  };

  const handleDestructiveActionInput = (field, value) => {
    setDestructiveAction((prev) => ({
      ...prev,
      [field]: value,
      codeError: field === 'adminCode' ? '' : prev.codeError,
      actionError: field === 'reason' ? '' : prev.actionError
    }));
  };

  const verifyDestructiveActionCode = async () => {
    if (!destructiveAction.adminCode.trim()) {
      setDestructiveAction((prev) => ({
        ...prev,
        codeError: 'Admin kodu yanlışdır'
      }));
      return;
    }

    setDestructiveAction((prev) => ({
      ...prev,
      isSubmitting: true,
      codeError: '',
      actionError: ''
    }));

    try {
      const response = await axios.post(`${API_BASE}/api/admin/verify-code`, {
        code: destructiveAction.adminCode.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.data?.success) {
        setDestructiveAction((prev) => ({
          ...prev,
          isSubmitting: false,
          codeError: response.data?.message || 'Admin kodu yanlışdır'
        }));
        return;
      }

      setDestructiveAction((prev) => ({
        ...prev,
        step: 4,
        isSubmitting: false,
        codeError: ''
      }));
    } catch (err) {
      const isNetworkError = !err.response;
      setDestructiveAction((prev) => ({
        ...prev,
        isSubmitting: false,
        codeError: isNetworkError
          ? 'Şəbəkə xətası baş verdi. Yenidən cəhd edin'
          : (err.response?.data?.message || 'Admin kodu yanlışdır')
      }));
    }
  };

  const executeDestructiveAction = async () => {
    const adminCode = destructiveAction.adminCode.trim();
    const reason = destructiveAction.reason.trim();

    if (!adminCode) {
      setDestructiveAction((prev) => ({
        ...prev,
        actionError: 'Admin kodu yanlışdır'
      }));
      return;
    }

    if (destructiveAction.actionType === 'cancel-order' && !reason) {
      setDestructiveAction((prev) => ({
        ...prev,
        actionError: 'Ləğv səbəbi tələb olunur'
      }));
      return;
    }

    setDestructiveAction((prev) => ({
      ...prev,
      isSubmitting: true,
      actionError: ''
    }));

    try {
      if (destructiveAction.actionType === 'delete-courier') {
        await axios.delete(`${API_BASE}/api/couriers/${destructiveAction.targetId}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { adminCode }
        });
        setCouriers((prev) => prev.filter((courier) => String(courier.id) !== String(destructiveAction.targetId)));
        await fetchCouriers();
      } else if (destructiveAction.actionType === 'delete-store') {
        await axios.delete(`${API_BASE}/api/stores/${destructiveAction.targetId}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { adminCode }
        });
        setStores((prev) => prev.filter((store) => String(store.id) !== String(destructiveAction.targetId)));
        await fetchStores();
      } else if (destructiveAction.actionType === 'delete-expense') {
        setExpenses((prev) => prev.filter((item) => String(item.id) !== String(destructiveAction.targetId)));
      } else if (destructiveAction.actionType === 'cancel-payment') {
        await axios.post(`${API_BASE}/api/admin/payments/${destructiveAction.targetId}/cancel`, {
          adminCode
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await Promise.all([fetchPayments(), fetchAllOrders(false)]);
      } else if (destructiveAction.actionType === 'cancel-order') {
        await axios.post(`${API_BASE}/api/admin/orders/${destructiveAction.targetId}/cancel`, {
          adminCode,
          cancelReason: reason
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchAllOrders();
      }

      closeDestructiveActionModal();
      showSuccess(getDestructiveActionConfig(destructiveAction.actionType).successMessage);
    } catch (err) {
      setDestructiveAction((prev) => ({
        ...prev,
        isSubmitting: false,
        actionError: err.response?.status === 401
          ? 'Admin kodu yanlışdır'
          : (err.response?.data?.error || 'Əməliyyat icra edilərkən xəta baş verdi')
      }));
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1100) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const fetchPendingOrders = async () => {
    setPendingError('');
    setPendingLoading(true);

    try {
      const response = await axios.get(`${API_BASE}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingOrders(response.data.orders || []);
    } catch (err) {
      console.error('Pending orders fetch error:', err);
      setPendingError(err.response?.data?.error || 'Gözləyən sifarişlər alınarkən xəta baş verdi');
    } finally {
      setPendingLoading(false);
    }
  };

  const fetchCouriers = async () => {
    setCouriersLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/couriers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCouriers(response.data.couriers || []);
    } catch (err) {
      console.error('Couriers fetch error:', err);
      setPendingError(err.response?.data?.error || 'Kuryerlər alınarkən xəta baş verdi');
    } finally {
      setCouriersLoading(false);
    }
  };

  const fetchAllOrders = async (showLoading = true) => {
    setAllOrdersError('');
    if (showLoading) setAllOrdersLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllOrders(response.data.orders || []);
    } catch (err) {
      console.error('All orders fetch error:', err);
      setAllOrdersError(err.response?.data?.error || 'Bütün sifarişlər alınarkən xəta baş verdi');
    } finally {
      if (showLoading) setAllOrdersLoading(false);
    }
  };

  const fetchStores = async () => {
    setStoresLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/admin/stores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Admin stores response:', response.data?.stores || []);
      setStores(response.data.stores || []);
    } catch (err) {
      console.error('Stores fetch error:', err);
    } finally {
      setStoresLoading(false);
    }
  };

  const fetchPayments = async (storeId = '') => {
    setPaymentsError('');
    setPaymentsLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/payments`, {
        params: storeId ? { storeId } : undefined,
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(response.data.payments || []);
    } catch (err) {
      console.error('Payments fetch error:', err);
      setPaymentsError(err.response?.data?.error || 'Ödənişlər alınarkən xəta baş verdi');
    } finally {
      setPaymentsLoading(false);
    }
  };

  const hasCourierActiveOrders = (courierId) => {
    return allOrders.some(
      (order) => String(order.courierId) === String(courierId) && !['delivered', 'legv_edildi'].includes(order.status) && !isCancelledStatus(order.status)
    );
  };

  const hasStoreOrders = (storeId) => {
    return allOrders.some((order) => String(order.storeId) === String(storeId));
  };

  const handleDeleteCourier = async (id) => {
    if (hasCourierActiveOrders(id)) {
      window.alert('Bu kuryerin aktiv sifarişləri var!');
      return;
    }

    openDestructiveActionModal('delete-courier', id);
  };

  const handleDeleteStore = async (id) => {
    if (hasStoreOrders(id)) {
      window.alert('Bu mağazanın sifarişləri var!');
      return;
    }

    openDestructiveActionModal('delete-store', id);
  };

  const calculateStats = (orders) => {
    const totalOrders = orders.length;
    const totalEarnings = orders
      .filter(isCountedInEarnings)
      .reduce((sum, order) => sum + (parseFloat(order.price) || 0), 0);
    const cancelledOrders = orders.filter((order) => isCancelledStatus(order.status)).length;

    setStats({ totalEarnings, totalOrders, cancelledOrders });
  };

  const filterOrders = (orders) => {
    return orders.filter(order => {
      // Store filter
      if (selectedStore && selectedStore !== 'all') {
        if (order.storeId !== selectedStore) {
          return false;
        }
      }

      // Date filter
      if (dateFrom || dateTo) {
        const orderDate = new Date(order.createdAt);
        
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          if (orderDate < fromDate) {
            return false;
          }
        }
        
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999); // End of day
          if (orderDate > toDate) {
            return false;
          }
        }
      }

      return true;
    });
  };

  const clearFilters = () => {
    setSelectedStore('');
    setDateFrom('');
    setDateTo('');
  };

  const normalizeSearchValue = (value) => String(value || '').toLocaleLowerCase('az-AZ').trim();
  const matchesSearch = (...values) => {
    const normalizedQuery = normalizeSearchValue(adminSearchQuery);
    if (!normalizedQuery) {
      return true;
    }

    return values.some((value) => normalizeSearchValue(value).includes(normalizedQuery));
  };

  const filterOrdersBySearch = (orders = []) => orders.filter((order) => matchesSearch(
    order?.id,
    order?._id,
    order?.customerName,
    order?.customerPhone,
    order?.phone,
    order?.address,
    order?.storeName,
    order?.courierName,
    order?.status,
    order?.note,
    order?.cancelReason,
    order?.price,
    formatDisplayDate(order?.createdAt)
  ));

  const filterPaymentsBySearch = (paymentsToFilter = []) => paymentsToFilter.filter((payment) => {
    const matchedStore = safeStores.find((store) => String(store?.id) === String(payment?.storeId));
    return matchesSearch(
      payment?.id,
      payment?.storeId,
      payment?.amount,
      payment?.status,
      payment?.note,
      matchedStore?.name,
      matchedStore?.phone,
      formatDisplayDate(payment?.createdAt)
    );
  });

  const filterCouriersBySearch = (couriersToFilter = []) => couriersToFilter.filter((courier) => matchesSearch(
    courier?.id,
    courier?.name,
    courier?.phone,
    courier?.code,
    courier?.password,
    courier?.orderCount,
    courier?.totalEarnings
  ));

  const filterStoresBySearch = (storesToFilter = []) => storesToFilter.filter((store) => matchesSearch(
    store?.id,
    store?.name,
    store?.phone,
    store?.address,
    store?.code,
    store?.orderCount,
    store?.totalEarnings
  ));

  const filterStoreSummariesBySearch = (storesToFilter = []) => storesToFilter.filter((store) => matchesSearch(
    store?.id,
    store?.name,
    store?.phone,
    store?.address,
    store?.remaining,
    store?.totalOrders,
    store?.totalPaid
  ));

  const handleTodayFilter = () => {
    const today = getTodayString();
    setSelectedStore('');
    setDateFrom(today);
    setDateTo(today);
  };

  function filterPayments(paymentsToFilter = []) {
    if (!Array.isArray(paymentsToFilter)) {
      return [];
    }

    return paymentsToFilter.filter((payment) => {
      if (!payment) {
        return false;
      }

      // Store filter
      if (paymentStoreFilter && paymentStoreFilter !== 'all') {
        if (String(payment?.storeId ?? '') !== String(paymentStoreFilter)) {
          return false;
        }
      }

      // Date filter
      if (paymentDateFrom || paymentDateTo) {
        const paymentDate = new Date(payment?.createdAt);
        if (Number.isNaN(paymentDate.getTime())) {
          return false;
        }
        
        if (paymentDateFrom) {
          const fromDate = new Date(paymentDateFrom);
          if (paymentDate < fromDate) {
            return false;
          }
        }
        
        if (paymentDateTo) {
          const toDate = new Date(paymentDateTo);
          toDate.setHours(23, 59, 59, 999); // End of day
          if (paymentDate > toDate) {
            return false;
          }
        }
      }

      // Status filter
      if (paymentStatusFilter && paymentStatusFilter !== 'all') {
        if (payment?.status !== paymentStatusFilter) {
          return false;
        }
      }

      // Amount range filter
      const amount = parseFloat(payment?.amount);
      if (paymentMinAmount && !isNaN(parseFloat(paymentMinAmount))) {
        if (amount < parseFloat(paymentMinAmount)) {
          return false;
        }
      }
      if (paymentMaxAmount && !isNaN(parseFloat(paymentMaxAmount))) {
        if (amount > parseFloat(paymentMaxAmount)) {
          return false;
        }
      }

      return true;
    });
  }

  const clearPaymentFilters = () => {
    setPaymentStoreFilter('');
    setPaymentDateFrom('');
    setPaymentDateTo('');
    setPaymentStatusFilter('');
    setPaymentMinAmount('');
    setPaymentMaxAmount('');
  };

  const handlePaymentTodayFilter = () => {
    const today = getTodayString();
    setPaymentStoreFilter('');
    setPaymentDateFrom(today);
    setPaymentDateTo(today);
    setPaymentStatusFilter('');
    setPaymentMinAmount('');
    setPaymentMaxAmount('');
  };

  const calculateTodayTotal = (orders) => {
    const total = orders
      .filter(isOrderToday)
      .filter(isCountedInEarnings)
      .reduce((sum, order) => sum + (parseFloat(order.price) || 0), 0);
    setTodayTotal(total);
  };

  const getIncomeTotal = () => {
    return allOrders
      .filter(isCountedInEarnings)
      .reduce((sum, order) => sum + (parseFloat(order.price) || 0), 0);
  };

  const normalizeExpense = (expense = {}) => ({
    id: expense.id || Date.now(),
    title: expense.title || expense.reason || '',
    reason: expense.reason || expense.title || '',
    amount: expense.amount,
    date: expense.date || getTodayString()
  });

  const getExpenseTotal = () => {
    return expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  };

  const getProfitTotal = () => {
    return getIncomeTotal() - getExpenseTotal();
  };

  const filterReportOrders = (ordersToFilter = []) => {
    if (!Array.isArray(ordersToFilter)) {
      return [];
    }

    return ordersToFilter.filter((order) => {
      if (!order?.createdAt) {
        return false;
      }

      if (reportStoreFilter && String(order?.storeId ?? '') !== String(reportStoreFilter)) {
        return false;
      }

      if (reportStatusFilter) {
        if (reportStatusFilter === 'courier_cancelled' && !isCourierCancelled(order)) {
          return false;
        }

        if (reportStatusFilter === 'admin_cancelled' && !isAdminCancelled(order)) {
          return false;
        }

        if (reportStatusFilter === 'counted' && !isCountedInEarnings(order)) {
          return false;
        }

        if (!['courier_cancelled', 'admin_cancelled', 'counted'].includes(reportStatusFilter) && order?.status !== reportStatusFilter) {
          return false;
        }
      }

      const orderDate = new Date(order.createdAt);
      if (Number.isNaN(orderDate.getTime())) {
        return false;
      }

      if (reportFilterMode === 'today') {
        return formatDateInput(orderDate) === getTodayString();
      }

      if (reportFilterMode === 'yesterday') {
        return formatDateInput(orderDate) === getYesterdayString();
      }

      if (reportFilterMode === 'range') {
        if (reportStartDate) {
          const start = new Date(reportStartDate);
          if (orderDate < start) {
            return false;
          }
        }

        if (reportEndDate) {
          const end = new Date(reportEndDate);
          end.setHours(23, 59, 59, 999);
          if (orderDate > end) {
            return false;
          }
        }
      }

      return true;
    });
  };

  const filterReportExpenses = (expensesToFilter = []) => {
    if (!Array.isArray(expensesToFilter)) {
      return [];
    }

    return expensesToFilter.filter((expense) => {
      if (!expense?.date) {
        return false;
      }

      const expenseDate = new Date(expense.date);
      if (Number.isNaN(expenseDate.getTime())) {
        return false;
      }

      if (reportFilterMode === 'today') {
        if (formatDateInput(expenseDate) !== getTodayString()) {
          return false;
        }
      } else if (reportFilterMode === 'yesterday') {
        if (formatDateInput(expenseDate) !== getYesterdayString()) {
          return false;
        }
      } else if (reportFilterMode === 'range') {
        if (reportStartDate) {
          const start = new Date(reportStartDate);
          if (expenseDate < start) {
            return false;
          }
        }

        if (reportEndDate) {
          const end = new Date(reportEndDate);
          end.setHours(23, 59, 59, 999);
          if (expenseDate > end) {
            return false;
          }
        }
      }

      if (adminSearchQuery.trim()) {
        return matchesSearch(expense?.title, expense?.reason, expense?.amount, formatDisplayDate(expense?.date));
      }

      return true;
    });
  };

  const getReportSummary = (ordersToSummarize = [], expensesToSummarize = []) => {
    const deliveredOrders = ordersToSummarize.filter(isDeliveredOrder);
    const cancelledOrders = ordersToSummarize.filter((order) => isCancelledStatus(order?.status));
    const adminCancelledOrders = cancelledOrders.filter(isAdminCancelled);
    const courierCancelledOrders = cancelledOrders.filter(isCourierCancelled);
    const includedOrders = ordersToSummarize.filter(isCountedInEarnings);
    const pendingOrders = ordersToSummarize.filter((order) => !isCountedInEarnings(order) && !isCancelledStatus(order?.status));
    const courierCancelledTotal = courierCancelledOrders.reduce((sum, order) => sum + getOrderFinancialAmount(order), 0);
    const adminCancelledTotal = adminCancelledOrders.reduce((sum, order) => sum + getOrderFinancialAmount(order), 0);
    const totalIncome = includedOrders.reduce((sum, order) => sum + getOrderFinancialAmount(order), 0);
    const totalExpenses = expensesToSummarize.reduce((sum, expense) => sum + (parseFloat(expense?.amount) || 0), 0);
    const netProfit = totalIncome - totalExpenses;

    return {
      totalOrders: ordersToSummarize.length,
      deliveredOrders: deliveredOrders.length,
      cancelledOrders: cancelledOrders.length,
      adminCancelledOrders: adminCancelledOrders.length,
      courierCancelledOrders: courierCancelledOrders.length,
      courierCancelledTotal,
      adminCancelledTotal,
      pendingOrders: pendingOrders.length,
      totalEarnings: totalIncome,
      totalIncome,
      totalExpenses,
      netProfit
    };
  };

  const getStoreGroupedReport = (ordersToGroup = []) => {
    const grouped = ordersToGroup.reduce((acc, order) => {
      const storeKey = String(order?.storeId ?? order?.storeName ?? 'unknown');
      if (!acc[storeKey]) {
        const matchedStore = safeStores.find((store) => String(store?.id) === String(order?.storeId));
        acc[storeKey] = {
          storeId: order?.storeId || matchedStore?.id || storeKey,
          storeName: matchedStore?.name || order?.storeName || 'Naməlum mağaza',
          totalOrders: 0,
          deliveredOrders: 0,
          courierCancelledOrders: 0,
          adminCancelledOrders: 0,
          cancelledOrders: 0,
          totalEarnings: 0
        };
      }

      acc[storeKey].totalOrders += 1;

      if (isDeliveredOrder(order)) {
        acc[storeKey].deliveredOrders += 1;
      }

      if (isCourierCancelled(order)) {
        acc[storeKey].courierCancelledOrders += 1;
      }

      if (isAdminCancelled(order)) {
        acc[storeKey].adminCancelledOrders += 1;
      }

      if (isCancelledStatus(order?.status)) {
        acc[storeKey].cancelledOrders += 1;
      }

      if (isCountedInEarnings(order)) {
        acc[storeKey].totalEarnings += getOrderFinancialAmount(order);
      }

      return acc;
    }, {});

    return Object.values(grouped).sort((firstStore, secondStore) => secondStore.totalEarnings - firstStore.totalEarnings);
  };

  const getDailyReport = (ordersToGroup = []) => {
    const grouped = {};
    ordersToGroup.forEach((order) => {
      if (!order.createdAt) return;
      const date = new Date(order.createdAt);
      const key = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth()+1).toString().padStart(2, '0')}.${date.getFullYear()}`;
      if (!grouped[key]) {
        grouped[key] = {
          date: key,
          count: 0,
          cancelledOrders: 0,
          courierCancelledOrders: 0,
          adminCancelledOrders: 0,
          income: 0
        };
      }
      grouped[key].count += 1;
      if (isCancelledStatus(order.status)) {
        grouped[key].cancelledOrders += 1;
      }
      if (isCourierCancelled(order)) {
        grouped[key].courierCancelledOrders += 1;
      }
      if (isAdminCancelled(order)) {
        grouped[key].adminCancelledOrders += 1;
      }
      if (isCountedInEarnings(order)) {
        grouped[key].income += getOrderFinancialAmount(order);
      }
    });
    return Object.values(grouped).sort((a, b) => {
      const [dA, mA, yA] = a.date.split('.').map(Number);
      const [dB, mB, yB] = b.date.split('.').map(Number);
      return new Date(yB, mB - 1, dB) - new Date(yA, mA - 1, dA);
    });
  };

  const getMonthlyReport = (ordersToGroup = []) => {
    const grouped = {};
    ordersToGroup.forEach((order) => {
      if (!order.createdAt) return;
      const date = new Date(order.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!grouped[key]) {
        grouped[key] = {
          month: monthNamesAz[date.getMonth()],
          year: date.getFullYear(),
          count: 0,
          cancelledOrders: 0,
          courierCancelledOrders: 0,
          adminCancelledOrders: 0,
          income: 0
        };
      }
      grouped[key].count += 1;
      if (isCancelledStatus(order.status)) {
        grouped[key].cancelledOrders += 1;
      }
      if (isCourierCancelled(order)) {
        grouped[key].courierCancelledOrders += 1;
      }
      if (isAdminCancelled(order)) {
        grouped[key].adminCancelledOrders += 1;
      }
      if (isCountedInEarnings(order)) {
        grouped[key].income += getOrderFinancialAmount(order);
      }
    });
    return Object.values(grouped).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return monthNamesAz.indexOf(b.month) - monthNamesAz.indexOf(a.month);
    });
  };

  const getReportActiveDebt = (ordersToSummarize = []) => {
    const totalsByStore = ordersToSummarize.reduce((accumulator, order) => {
      const storeKey = String(order?.storeId ?? '');
      if (!storeKey || !shouldCountInStoreDebt(order)) {
        return accumulator;
      }

      accumulator[storeKey] = (accumulator[storeKey] || 0) + getOrderFinancialAmount(order);
      return accumulator;
    }, {});

    return Object.entries(totalsByStore).reduce((sum, [storeKey, total]) => {
      const paid = paymentsByStoreId[storeKey] || 0;
      return sum + Math.max(total - paid, 0);
    }, 0);
  };

  const getReportStatusLabel = (order) => {
    if (isCourierCancelled(order)) {
      return 'Kuryer ləğvi';
    }

    if (isAdminCancelled(order)) {
      return 'Admin ləğvi';
    }

    return statusLabels[order?.status] || order?.status || 'Naməlum';
  };

  const getCancelledByPersonLabel = (order) => {
    if (isCourierCancelled(order)) {
      return 'Kuryer';
    }

    if (isAdminCancelled(order)) {
      return 'Admin';
    }

    return '-';
  };

  const exportReportCsv = (ordersToExport = []) => {
    const rows = [
      ['Tarix', 'Mağaza', 'Məbləğ', 'Status', 'Kim ləğv edib']
    ];

    ordersToExport.forEach((order) => {
      rows.push([
        formatDisplayDate(order?.createdAt),
        order?.storeName || 'Naməlum mağaza',
        String(getOrderFinancialAmount(order).toFixed(2)),
        getReportStatusLabel(order),
        getCancelledByPersonLabel(order)
      ]);
    });

    const csvContent = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hesabat-${reportStartDate || 'all'}-${reportEndDate || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    calculateTodayTotal(allOrders);
  }, [allOrders]);

  useEffect(() => {
    const storedExpenses = localStorage.getItem('adminExpenses');
    if (storedExpenses) {
      try {
        const parsedExpenses = JSON.parse(storedExpenses);
        setExpenses(Array.isArray(parsedExpenses) ? parsedExpenses.map(normalizeExpense) : []);
      } catch (err) {
        console.error('Expense parse error:', err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('adminExpenses', JSON.stringify(expenses.map(normalizeExpense)));
  }, [expenses]);

  useEffect(() => {
    if (activeTab === 'home') {
      fetchAllOrders();
      fetchCouriers();
      fetchStores();
    } else if (activeTab === 'pending') {
      fetchPendingOrders();
      fetchCouriers();
    } else if (activeTab === 'orders') {
      fetchAllOrders();
      fetchCouriers();
      fetchStores();
    } else if (activeTab === 'payments') {
      fetchAllOrders();
      fetchStores();
      fetchPayments();
    } else if (activeTab === 'couriers' || activeTab === 'stores') {
      fetchAllOrders();
      fetchCouriers();
      fetchStores();
    } else if (activeTab === 'reports') {
      fetchAllOrders();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'payments' && selectedPaymentStoreId === null && storePaymentSummary.length > 0) {
      setSelectedPaymentStoreId(storePaymentSummary[0].id);
      setPaymentStoreFilter(String(storePaymentSummary[0].id));
    }
  }, [activeTab, selectedPaymentStoreId, storePaymentSummary]);

  useEffect(() => {
    if (activeTab !== 'orders' && activeTab !== 'pending') {
      return undefined;
    }

    const interval = setInterval(() => {
      fetchAllOrders(false);
      if (activeTab === 'pending') {
        fetchPendingOrders();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Calculate stats whenever allOrders changes
  useEffect(() => {
    if (allOrders.length > 0) {
      calculateStats(allOrders);
    }
  }, [allOrders]);

  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    setExpenseError('');

    const amount = parseFloat(expenseForm.amount);
    if (!expenseForm.title.trim()) {
      setExpenseError('Zəhmət olmasa xərc başlığını daxil edin');
      return;
    }
    if (!expenseForm.date) {
      setExpenseError('Tarixi daxil edin');
      return;
    }
    if (Number.isNaN(amount) || amount <= 0) {
      setExpenseError('Məbləği düzgün daxil edin');
      return;
    }

    setExpenseLoading(true);
    const newExpense = normalizeExpense({
      id: Date.now(),
      amount: amount.toFixed(2),
      title: expenseForm.title,
      reason: expenseForm.title,
      date: expenseForm.date
    });

    setExpenses(prev => [newExpense, ...prev]);
    setExpenseForm({ amount: '', title: '', date: getTodayString() });
    setExpenseLoading(false);
  };

  const handleDeleteExpense = (id) => {
    openDestructiveActionModal('delete-expense', id);
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatOrderAmount = (amount) => {
    const numericAmount = parseFloat(amount);
    if (Number.isNaN(numericAmount)) {
      return '0 ₼';
    }

    return `${numericAmount.toLocaleString('az-AZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })} ₼`;
  };

  const formatDateInput = (value) => {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toISOString().split('T')[0];
  };

  const getOrderSummaryDate = (order) => {
    if (order.time) {
      return order.createdAt
        ? `${formatDisplayDate(order.createdAt)} • ${order.time}`
        : order.time;
    }

    return formatDisplayDate(order.createdAt);
  };

  const getOrderDeliveryLabel = (order) => {
    if (order.deliveryType === 'metro') {
      return `Metro - ${order.metroName || order.metro || 'Metro'}`;
    }

    return 'Xaric';
  };

  const formatOrderTableDate = (order) => {
    if (!order?.createdAt) {
      return 'N/A';
    }

    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleDateString('az-AZ', {
      day: '2-digit',
      month: 'short'
    });
  };

  const getPaymentReceiptUrl = (payment) => {
    const rawUrl = payment?.file || payment?.receipt || payment?.image || payment?.receiptUrl || payment?.receipt?.receiptUrl || '';
    if (!rawUrl) {
      return '';
    }

    if (/^(data:|blob:|https?:)/i.test(rawUrl)) {
      return rawUrl;
    }

    return `${API_BASE}/uploads/${rawUrl}`;
  };

  const getPaymentReceiptKey = (payment) => String(payment?.id || payment?.createdAt || 'unknown');

  const getPaymentStatusLabel = (status) => {
    if (status === 'approved') {
      return 'Təsdiq edildi';
    }
    if (status === 'cancelled' || status === 'rejected') {
      return 'Rədd edildi';
    }
    return 'Gözləyir';
  };

  const getPaymentStatusClass = (status) => {
    if (status === 'approved') {
      return 'status-delivered';
    }
    if (status === 'cancelled' || status === 'rejected') {
      return 'status-cancelled';
    }
    return 'status-pending';
  };

  const renderPaymentStatusBadge = (status) => (
    <span className={`status-badge ${getPaymentStatusClass(status)}`}>
      {getPaymentStatusLabel(status)}
    </span>
  );

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

  const getOrderIdValue = (order) => String(order?.id ?? order?._id ?? '');
  const getPaymentIdValue = (payment) => String(payment?.id ?? `${payment?.storeId ?? 'payment'}-${payment?.createdAt ?? ''}`);
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

  const openOrderDetails = (order, options = {}) => {
    setOpenOrderId(getOrderIdValue(order));
    setOpenOrderOptions(options);
  };

  const closeOrderDetails = () => {
    setOpenOrderId(null);
    setOpenOrderOptions({});
  };

  const renderOrdersTable = (orders, options = {}) => {
    const sortedOrders = orders
      .slice()
      .sort((firstOrder, secondOrder) => new Date(secondOrder.createdAt) - new Date(firstOrder.createdAt));

    return (
      <div className="orders-table-shell">
        <div className="orders-table-scroll">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mağaza</th>
                <th>Status</th>
                <th>Məbləğ</th>
                <th>Tarix</th>
                <th>Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order) => {
                const orderId = getOrderIdValue(order);

                return (
                  <tr
                    key={options.keyPrefix ? `${options.keyPrefix}-${orderId}` : orderId}
                    className="orders-table-clickable-row"
                    onClick={() => openOrderDetails(order, options)}
                  >
                    <td data-label="ID" className="orders-table-id">#{orderId || 'N/A'}</td>
                    <td data-label="Mağaza">{order.storeName || 'N/A'}</td>
                    <td data-label="Status">{renderStatusBadge(order.status)}</td>
                    <td data-label="Məbləğ" className="orders-table-amount">{formatOrderAmount(order.price)}</td>
                    <td data-label="Tarix">{formatOrderTableDate(order)}</td>
                    <td data-label="Əməliyyat">
                      <button
                        type="button"
                        className="view-order-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openOrderDetails(order, options);
                        }}
                      >
                        Bax
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPaymentsList = (paymentsToRender, sectionKey) => {
    const sortedPayments = paymentsToRender
      .slice()
      .sort((firstPayment, secondPayment) => new Date(secondPayment?.createdAt || 0) - new Date(firstPayment?.createdAt || 0));

    if (sortedPayments.length === 0) {
      return <p>Ödəniş yoxdur.</p>;
    }

    return (
      <div className="admin-list-shell">
        <div className="admin-list-header admin-list-row admin-list-row-payments">
          <span>ID</span>
          <span>Tarix</span>
          <span>Məbləğ</span>
          <span>Status</span>
          <span>Qəbz</span>
        </div>
        {sortedPayments.map((payment) => {
          const paymentId = getPaymentIdValue(payment);
          const expandedKey = `${sectionKey}-${paymentId}`;
          const isExpanded = expandedPaymentRowId === expandedKey;
          const receiptUrl = getPaymentReceiptUrl(payment);
          const receiptKey = getPaymentReceiptKey(payment);

          return (
            <React.Fragment key={expandedKey}>
              <button
                type="button"
                className={`admin-list-row admin-list-row-button admin-list-row-payments ${isExpanded ? 'is-expanded' : ''}`}
                onClick={() => setExpandedPaymentRowId((currentValue) => (currentValue === expandedKey ? null : expandedKey))}
              >
                <span className="admin-list-primary">{formatCompactId(paymentId)}</span>
                <span>{formatCompactDate(payment?.createdAt)}</span>
                <span className="admin-list-amount">₼ {(parseFloat(payment?.amount) || 0).toFixed(2)}</span>
                <span>{renderPaymentStatusBadge(payment?.status || 'pending')}</span>
                <span>{receiptUrl ? 'Var' : '-'}</span>
              </button>
              {isExpanded && (
                <div className="admin-list-expand">
                  <div className="admin-list-expand-grid">
                    <div className="admin-list-detail-item">
                      <span className="admin-list-detail-label">Mağaza ID</span>
                      <span>{payment?.storeId || 'N/A'}</span>
                    </div>
                    <div className="admin-list-detail-item">
                      <span className="admin-list-detail-label">Status</span>
                      <span>{getPaymentStatusLabel(payment?.status)}</span>
                    </div>
                    <div className="admin-list-detail-item">
                      <span className="admin-list-detail-label">Qeyd</span>
                      <span>{payment?.note || 'Yoxdur'}</span>
                    </div>
                    <div className="admin-list-detail-item">
                      <span className="admin-list-detail-label">Qəbz</span>
                      <span>
                        {receiptUrl ? (
                          isImageReceiptUrl(receiptUrl) ? (
                            <img
                              src={receiptUrl}
                              alt="Qəbz önizləmə"
                              className="admin-list-receipt-thumb"
                              onClick={(event) => {
                                event.stopPropagation();
                                openImageZoom(receiptUrl);
                              }}
                              onError={() => {
                                setReceiptOpenErrors((prev) => ({ ...prev, [receiptKey]: 'Fayl açıla bilmədi' }));
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
                  {receiptOpenErrors[receiptKey] && (
                    <div className="error-message">{receiptOpenErrors[receiptKey]}</div>
                  )}
                  <div className="admin-list-actions">
                    {payment?.status === 'pending' && payment?.id && (
                      <>
                        <button
                          type="button"
                          className="assign-button"
                          onClick={() => handleApprovePayment(payment.id)}
                        >
                          Təsdiq et
                        </button>
                        <button
                          type="button"
                          className="cancel-button"
                          onClick={() => handleCancelPayment(payment.id)}
                        >
                          Ləğv et
                        </button>
                      </>
                    )}
                    {payment?.status === 'approved' && payment?.id && (
                      <button
                        type="button"
                        className="cancel-button"
                        onClick={() => handleCancelPayment(payment.id)}
                      >
                        Ləğv et
                      </button>
                    )}
                    <button
                      type="button"
                      className="submit-button"
                      onClick={() => {
                        if (!payment?.storeId) {
                          return;
                        }

                        setReceiptPayment(payment);
                        setSelectedPaymentStoreId(payment.storeId);
                        setShowReceiptModal(true);
                      }}
                    >
                      Qəbz yarat
                    </button>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderCourierList = () => {
    const visibleCouriers = filterCouriersBySearch(courierReport);

    if (visibleCouriers.length === 0) {
      return <p>Heç bir kuryer tapılmadı.</p>;
    }

    return (
      <div className="admin-list-shell">
        <div className="admin-list-header admin-list-row admin-list-row-entities">
          <span>ID</span>
          <span>Ad</span>
          <span>Telefon</span>
          <span>Sifariş</span>
          <span>Qazanc</span>
        </div>
        {visibleCouriers.map((courier) => {
          const isExpanded = expandedCourierId === String(courier.id);
          const orderCount = Number(courier?.orderCount ?? courier?.orders?.length ?? 0);

          return (
            <React.Fragment key={courier.id}>
              <button
                type="button"
                className={`admin-list-row admin-list-row-button admin-list-row-entities ${isExpanded ? 'is-expanded' : ''}`}
                onClick={() => setExpandedCourierId((currentValue) => (currentValue === String(courier.id) ? null : String(courier.id)))}
              >
                <span className="admin-list-primary">{formatCompactId(courier.id)}</span>
                <span>{courier.name || 'N/A'}</span>
                <span>{courier.phone || 'Telefon yoxdur'}</span>
                <span>{orderCount.toLocaleString('az-AZ')}</span>
                <span className="admin-list-amount">₼ {courier.totalEarnings.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </button>
              {isExpanded && (
                <div className="admin-list-expand">
                  <div className="admin-list-expand-grid">
                    <div className="admin-list-detail-item">
                      <span className="admin-list-detail-label">Ad</span>
                      <span>{courier.name || '-'}</span>
                    </div>
                    <div className="admin-list-detail-item">
                      <span className="admin-list-detail-label">Username</span>
                      <span>{courier.name || '-'}</span>
                    </div>
                    <div className="admin-list-detail-item">
                      <span className="admin-list-detail-label">Kod</span>
                      <span>{courier.code || courier.password || '-'}</span>
                    </div>
                    <div className="admin-list-detail-item">
                      <span className="admin-list-detail-label">Telefon</span>
                      <span>{courier.phone || 'Telefon yoxdur'}</span>
                    </div>
                    <div className="admin-list-detail-item">
                      <span className="admin-list-detail-label">Sifariş sayı</span>
                      <span>{orderCount.toLocaleString('az-AZ')}</span>
                    </div>
                  </div>
                  <div className="admin-list-actions">
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleDeleteCourier(courier.id)}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderStoreList = () => {
    const visibleStores = filterStoresBySearch(storeReport);

    if (visibleStores.length === 0) {
      return <p>Heç bir mağaza tapılmadı.</p>;
    }

    return (
      <div className="admin-list-shell">
        <div className="admin-list-header admin-list-row admin-list-row-stores">
          <span>ID</span>
          <span>Mağaza</span>
          <span>Telefon</span>
          <span>Sifariş</span>
          <span>Qazanc</span>
        </div>
        {visibleStores.map((store) => {
          const isExpanded = expandedStoreId === String(store.id);
          const orderCount = Number(store?.orderCount ?? store?.orders?.length ?? 0);
          const earnings = Number(store?.earnings ?? store?.totalAmount ?? store?.totalEarnings ?? 0);
          const storeStatus = store?.status || 'active';

          return (
            <React.Fragment key={store.id}>
              <button
                type="button"
                className={`admin-list-row admin-list-row-button admin-list-row-stores ${isExpanded ? 'is-expanded' : ''}`}
                onClick={() => setExpandedStoreId((currentValue) => (currentValue === String(store.id) ? null : String(store.id)))}
              >
                <span className="admin-list-primary">{formatCompactId(store.id)}</span>
                <span>{store.name || 'N/A'}</span>
                <span>{store.phone || 'Telefon yoxdur'}</span>
                <span>{orderCount.toLocaleString('az-AZ')}</span>
                <span className="admin-list-amount">₼ {earnings.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </button>
              {isExpanded && (
                <div className="admin-list-expand">
                  <div className="admin-list-expand-grid">
                    <div className="admin-list-detail-item">
                      <span className="admin-list-detail-label">Ad</span>
                      <span>{store.name || '-'}</span>
                    </div>
                    <div className="admin-list-detail-item">
                      <span className="admin-list-detail-label">Telefon</span>
                      <span>{store.phone || 'Telefon yoxdur'}</span>
                    </div>
                    <div className="admin-list-detail-item">
                      <span className="admin-list-detail-label">Ünvan</span>
                      <span>{store.address || 'Ünvan yoxdur'}</span>
                    </div>
                    <div className="admin-list-detail-item">
                      <span className="admin-list-detail-label">Kod</span>
                      <span>{store.code || '-'}</span>
                    </div>
                    <div className="admin-list-detail-item">
                      <span className="admin-list-detail-label">Sifariş sayı</span>
                      <span>{orderCount.toLocaleString('az-AZ')}</span>
                    </div>
                    <div className="admin-list-detail-item">
                      <span className="admin-list-detail-label">Qazanc</span>
                      <span>₼ {earnings.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="admin-list-detail-item">
                      <span className="admin-list-detail-label">Status</span>
                      <span>{storeStatus}</span>
                    </div>
                  </div>
                  <div className="admin-list-actions">
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleDeleteStore(store.id)}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const expenseTotal = getExpenseTotal();
  const reportOrders = filterReportOrders(safeAllOrders);
  const reportExpenses = filterReportExpenses(expenses.map(normalizeExpense));
  const searchedPendingOrders = filterOrdersBySearch(pendingOrders);
  const filteredOrders = filterOrders(allOrders);
  const searchedFilteredOrders = filterOrdersBySearch(filteredOrders);
  const searchedAllOrders = filterOrdersBySearch(allOrders);
  const searchedStorePaymentSummary = filterStoreSummariesBySearch(storePaymentSummary);
  const searchedSelectedStorePayments = filterPaymentsBySearch(filteredSelectedStorePayments);
  const searchedReportOrders = filterOrdersBySearch(reportOrders);
  const activeReportOrders = adminSearchQuery.trim() ? searchedReportOrders : reportOrders;
  const reportSummary = getReportSummary(activeReportOrders, reportExpenses);
  const dailyReport = getDailyReport(activeReportOrders);
  const monthlyReport = getMonthlyReport(activeReportOrders);
  const storeGroupedReport = getStoreGroupedReport(activeReportOrders);
  const reportActiveDebt = getReportActiveDebt(activeReportOrders);
  const chartData = dailyReport.slice().reverse();
  const lineChartData = chartData.map((item, index) => ({ ...item, index }));
  const lineChartMaxIncome = Math.max(...lineChartData.map((item) => item.income), 1);
  const lineChartPoints = lineChartData
    .map((item, index) => {
      const x = lineChartData.length === 1 ? 0 : (index / (lineChartData.length - 1)) * 100;
      const y = 100 - ((item.income || 0) / lineChartMaxIncome) * 100;
      return `${x},${Number.isFinite(y) ? y : 100}`;
    })
    .join(' ');
  const topStoreChartData = storeGroupedReport.slice(0, 6);
  const topStoreChartMax = Math.max(...topStoreChartData.map((item) => item.totalEarnings), 1);
  const statusChartData = [
    { label: 'Çatdırıldı', count: reportSummary.deliveredOrders, color: '#16a34a' },
    { label: 'Kuryer ləğvi', count: reportSummary.courierCancelledOrders, color: '#2563eb' },
    { label: 'Admin ləğvi', count: reportSummary.adminCancelledOrders, color: '#dc2626' },
    { label: 'Gözləyir', count: reportSummary.pendingOrders, color: '#d97706' }
  ].filter((item) => item.count > 0);
  const totalStatusCount = statusChartData.reduce((sum, item) => sum + item.count, 0);
  const statusPieGradient = totalStatusCount
    ? `conic-gradient(${statusChartData.reduce((segments, item, index) => {
      const previousTotal = statusChartData.slice(0, index).reduce((sum, currentItem) => sum + currentItem.count, 0);
      const start = (previousTotal / totalStatusCount) * 360;
      const end = ((previousTotal + item.count) / totalStatusCount) * 360;
      segments.push(`${item.color} ${start}deg ${end}deg`);
      return segments;
    }, []).join(', ')})`
    : 'conic-gradient(#e5e7eb 0deg 360deg)';
  const detailedReportRows = activeReportOrders
    .slice()
    .sort((firstOrder, secondOrder) => new Date(secondOrder.createdAt) - new Date(firstOrder.createdAt));
  const dashboardActiveOrders = safeAllOrders.filter(
    (order) => !isCancelledStatus(order?.status) && order?.status !== 'delivered'
  ).length;
  const dashboardPendingOrders = safeAllOrders.filter(
    (order) => order?.status === 'pending' || order?.status === 'teyin_edildi'
  ).length;
  const dashboardDebtTotal = storePaymentSummary.reduce(
    (sum, store) => sum + Math.max(store?.remaining || 0, 0),
    0
  );
  const adminNavItems = [
    { id: 'home', label: 'Dashboard', icon: '◫' },
    { id: 'orders', label: 'Sifarişlər', icon: '▤' },
    { id: 'pending', label: 'Gözləyən sifarişlər', icon: '◌' },
    { id: 'payments', label: 'Ödənişlər', icon: '◎' },
    { id: 'stores', label: 'Mağazalar', icon: '▣' },
    { id: 'couriers', label: 'Kuryerlər', icon: '↠' },
    { id: 'reports', label: 'Hesabatlar', icon: '◍' }
  ];
  const activeTabLabelMap = {
    home: 'Dashboard',
    orders: 'Sifarişlər',
    pending: 'Gözləyən sifarişlər',
    payments: 'Ödənişlər',
    stores: 'Mağazalar',
    couriers: 'Kuryerlər',
    reports: 'Hesabatlar',
    store: 'Yeni mağaza',
    courier: 'Yeni kuryer'
  };
  const searchPlaceholderMap = {
    home: 'Sifariş, mağaza və ya kuryer axtar',
    pending: 'Gözləyən sifariş axtar',
    orders: 'Sifariş, mağaza, telefon və ünvan axtar',
    payments: 'Ödəniş, mağaza və ya məbləğ axtar',
    reports: 'Hesabatda sifariş və mağaza axtar',
    couriers: 'Kuryer adı və ya telefon axtar',
    stores: 'Mağaza adı və ya telefon axtar',
    store: 'Mağaza formunda axtar',
    courier: 'Kuryer formunda axtar'
  };
  const pendingNotificationCount = safePayments.filter((payment) => payment?.status === 'pending').length;
  const notificationCount = pendingOrders.length + pendingNotificationCount;

  const setTodayReportFilter = () => {
    const today = getTodayString();
    setReportFilterMode('today');
    setReportStartDate(today);
    setReportEndDate(today);
  };

  const setYesterdayReportFilter = () => {
    const yesterday = getYesterdayString();
    setReportFilterMode('yesterday');
    setReportStartDate(yesterday);
    setReportEndDate(yesterday);
  };

  const setRangeReportFilter = () => {
    setReportFilterMode('range');
  };

  const handleSelectCourier = (orderId, courierId) => {
    setSelectedCouriers(prev => ({
      ...prev,
      [orderId]: courierId
    }));
  };

  const getOrderSelectedCourier = (order) => {
    if (Object.prototype.hasOwnProperty.call(selectedCouriers, order.id)) {
      return selectedCouriers[order.id];
    }

    return order.courierId || '';
  };

  const getCourierName = (courierId, fallbackName = '') => {
    if (!courierId) {
      return 'Təyin olunmayıb';
    }

    const courier = couriers.find((item) => String(item.id) === String(courierId));
    return courier?.name || fallbackName || 'Naməlum kuryer';
  };

  const handleAssignCourier = async (orderId) => {
    const courierId = selectedCouriers[orderId];
    if (!courierId) {
      setPendingError('Kuryer seçin və sonra təyin edin');
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/admin/orders/${orderId}/assign`, { courierId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSuccess('Kuryer təyin edildi');
      setSelectedCouriers(prev => ({ ...prev, [orderId]: '' }));
      await Promise.all([fetchPendingOrders(), fetchAllOrders(false)]);
    } catch (err) {
      console.error('Order assignment error:', err);
      setPendingError(err.response?.data?.error || 'Sifariş təyin edilərkən xəta baş verdi');
    }
  };

  const handleReassignOrder = async (orderId) => {
    const currentOrder = pendingOrders.find((order) => String(order.id) === String(orderId));
    const courierId = selectedCouriers[orderId] || currentOrder?.courierId;
    if (!courierId) {
      setPendingError('Kuryer seçin və sonra təyinatı dəyişdirin');
      return;
    }

    if (String(courierId) === String(currentOrder?.courierId)) {
      setPendingError('Təyinatı dəyişmək üçün başqa kuryer seçin');
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/admin/orders/${orderId}/reassign`, { courierId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSuccess('Sifariş başqa kuryerə təyin edildi');
      setSelectedCouriers(prev => ({ ...prev, [orderId]: '' }));
      await Promise.all([fetchPendingOrders(), fetchAllOrders(false)]);
    } catch (err) {
      setPendingError(err.response?.data?.error || 'Sifariş yenidən təyin edilərkən xəta baş verdi');
    }
  };

  const handleTransferOrder = async (orderId, currentCourierId) => {
    const courierId = selectedCouriers[orderId];
    if (!courierId) {
      setAllOrdersError('Kuryer seçin və sonra təhvil verin');
      return;
    }

    if (String(courierId) === String(currentCourierId)) {
      setAllOrdersError('Başqa kuryer seçilməlidir');
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/admin/orders/${orderId}/reassign`, { courierId }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showSuccess('Sifariş başqa kuryerə təhvil verildi');
      setSelectedCouriers(prev => ({ ...prev, [orderId]: '' }));
      fetchAllOrders();
      fetchPendingOrders();
    } catch (err) {
      setAllOrdersError(err.response?.data?.error || 'Sifariş başqa kuryerə təhvil verilərkən xəta baş verdi');
    }
  };

  const handleApprovePayment = async (paymentId) => {
    if (!window.confirm('Ödənişi təsdiq etmək istəyirsiniz?')) {
      return;
    }

    try {
      await axios.put(`${API_BASE}/api/payments/${paymentId}/approve`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showSuccess('Ödəniş təsdiqləndi');
      fetchPayments();
      fetchAllOrders();
    } catch (err) {
      const message = err.response?.data?.error || 'Ödəniş təsdiqlənərkən xəta baş verdi';
      window.alert(message);
    }
  };

  const handleCancelPayment = async (paymentId) => {
    openDestructiveActionModal('cancel-payment', paymentId);
  };

  const handleCancelOrder = async (orderId) => {
    openDestructiveActionModal('cancel-order', orderId);
  };

  // Store form handlers
  const handleStoreChange = (e) => {
    const { name, value } = e.target;
    setStoreForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    setStoreError('');
    setStoreLoading(true);

    try {
      await axios.post(`${API_BASE}/api/admin/store/create`, storeForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showSuccess('Mağaza uğurla əlavə edildi');
      setStoreForm({
        name: '',
        code: '',
        phone: '',
        address: '',
        metroPrice: '',
        outsidePrice: ''
      });
    } catch (err) {
      setStoreError(err.response?.data?.error || 'Xəta baş verdi');
    } finally {
      setStoreLoading(false);
    }
  };

  // Courier form handlers
  const handleCourierChange = (e) => {
    const { name, value } = e.target;
    setCourierForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCourier = async (e) => {
    e.preventDefault();
    setCourierError('');
    setCourierLoading(true);

    try {
      await axios.post(`${API_BASE}/api/admin/courier/create`, courierForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showSuccess('Kuryer uğurla əlavə edildi');
      setCourierForm({
        name: '',
        code: '',
        phone: ''
      });
    } catch (err) {
      setCourierError(err.response?.data?.error || 'Xəta baş verdi');
    } finally {
      setCourierLoading(false);
    }
  };

  return (
    <div className={`dashboard admin-dashboard ${isDarkMode ? 'admin-dark-theme' : ''}`}>
      <div className={`admin-dashboard-shell ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <div className="admin-sidebar-brand">
              <span className="admin-brand-mark">K</span>
              <div>
                <strong>Kargo System</strong>
                <span>Admin Panel</span>
              </div>
            </div>
            <button
              type="button"
              className="admin-sidebar-close"
              aria-label="Menyunu bağla"
              onClick={() => setIsSidebarOpen(false)}
            >
              ✕
            </button>
          </div>
          <nav className="admin-sidebar-nav">
            {adminNavItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`admin-sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
              >
                <span className="admin-sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <button
            type="button"
            className={`admin-sidebar-export-link ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('reports');
              setIsSidebarOpen(false);
            }}
          >
            <span className="admin-sidebar-export-icon">⤓</span>
            <span className="admin-sidebar-export-content">
              <strong>Çıxarış</strong>
              <span>A4 PDF hesabatları</span>
            </span>
          </button>
        </aside>

        <button
          type="button"
          className={`admin-sidebar-overlay ${isSidebarOpen ? 'is-visible' : ''}`}
          aria-label="Menyunu bağla"
          onClick={() => setIsSidebarOpen(false)}
        />

        <div className="admin-main-panel">
          <div className="admin-topbar admin-topbar-sticky">
            <div className="admin-topbar-title-block">
              <button
                type="button"
                className="admin-menu-toggle"
                aria-label={isSidebarOpen ? 'Menyunu bağla' : 'Menyunu aç'}
                aria-expanded={isSidebarOpen}
                onClick={() => setIsSidebarOpen((currentValue) => !currentValue)}
              >
                <span>{isSidebarOpen ? '✕' : '☰'}</span>
                <span>Menu</span>
              </button>
              <p className="admin-topbar-eyebrow">İdarəetmə paneli</p>
              <h1>{activeTabLabelMap[activeTab] || 'Admin Paneli'}</h1>
            </div>
            <div className="admin-topbar-actions">
              <label className="admin-searchbar" htmlFor="admin-global-search">
                <span className="admin-search-icon">⌕</span>
                <input
                  id="admin-global-search"
                  type="search"
                  value={adminSearchQuery}
                  onChange={(e) => setAdminSearchQuery(e.target.value)}
                  placeholder={searchPlaceholderMap[activeTab] || 'Axtar'}
                />
              </label>
              <div className="admin-topbar-icon-group">
                <button
                  type="button"
                  className="admin-icon-button"
                  onClick={() => setShowNotifications((currentValue) => !currentValue)}
                  aria-label="Bildirişlər"
                >
                  <span>🔔</span>
                  {notificationCount > 0 && <span className="admin-icon-badge">{notificationCount}</span>}
                </button>
                <button
                  type="button"
                  className="admin-icon-button"
                  onClick={() => setIsDarkMode((currentValue) => !currentValue)}
                  aria-label={isDarkMode ? 'İşıqlı rejimə keç' : 'Qaranlıq rejimə keç'}
                >
                  <span>{isDarkMode ? '☀' : '☾'}</span>
                </button>
              </div>
              <div className="admin-user-pill">
                <span className="admin-user-avatar">A</span>
                <div>
                  <strong>{user.name}</strong>
                  <span>Administrator</span>
                </div>
              </div>
              <button className="logout-button" onClick={handleLogout}>
                Çıxış
              </button>
            </div>
          </div>

          {showNotifications && (
            <div className="admin-notification-panel">
              <div className="admin-notification-item">
                <strong>{pendingOrders.length}</strong>
                <span>Gözləyən sifariş təsdiq gözləyir</span>
              </div>
              <div className="admin-notification-item">
                <strong>{pendingNotificationCount}</strong>
                <span>Ödəniş admin təsdiqi gözləyir</span>
              </div>
            </div>
          )}

          {successMessage && <div className="success-message admin-success-banner">{successMessage}</div>}

          <div className="dashboard-content admin-content-area">
        {activeTab === 'home' && (
          <>
            <div className="welcome-card admin-home-hero">
              <div>
                <h2>Xoş gəldiniz, {user.name}!</h2>
                <p>Sifariş, ödəniş və hesabat axınlarını bir paneldən idarə edin.</p>
              </div>
              <div className="user-info">
                <p><strong>İstifadəçi ID:</strong> {user.id}</p>
                <p><strong>Rol:</strong> Admin</p>
              </div>
            </div>

            <div className="stats-container admin-home-stats">
              <div className="stats-card premium-card admin-metric-card admin-metric-earnings">
                <div className="card-icon">₼</div>
                <h3>Ümumi qazanc</h3>
                <div className="stats-value">
                  ₼ {stats.totalEarnings.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="stats-card premium-card admin-metric-card admin-metric-today">
                <div className="card-icon">◔</div>
                <h3>Bugünkü qazanc</h3>
                <div className="stats-value">
                  ₼ {todayTotal.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="stats-card premium-card admin-metric-card admin-metric-orders">
                <div className="card-icon">▤</div>
                <h3>Aktiv sifarişlər</h3>
                <div className="stats-value">
                  {dashboardActiveOrders.toLocaleString('az-AZ')}
                </div>
              </div>
              <div className="stats-card premium-card admin-metric-card admin-metric-pending">
                <div className="card-icon">◌</div>
                <h3>Gözləyən sifarişlər</h3>
                <div className="stats-value">
                  {dashboardPendingOrders.toLocaleString('az-AZ')}
                </div>
              </div>
              <div className="stats-card premium-card admin-metric-card admin-metric-debt">
                <div className="card-icon">◎</div>
                <h3>Borclar</h3>
                <div className="stats-value">
                  ₼ {dashboardDebtTotal.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'pending' && (
          <div className="order-list-container">
            <h2>Gözləyən Sifarişlər</h2>
            {pendingError && <div className="error-message">{pendingError}</div>}
            {pendingLoading ? (
              <p>Yüklənir...</p>
            ) : searchedPendingOrders.length === 0 ? (
              <p>Gözləyən sifariş yoxdur.</p>
            ) : (
              renderOrdersTable(searchedPendingOrders, { showAssignment: true })
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="order-list-container">
            <h2>Filter nəticələri</h2>
            
            <div className="filters-section">
              <div className="filter-row">
                <div className="filter-group">
                  <label htmlFor="store-filter">Mağaza seç:</label>
                  <select
                    id="store-filter"
                    className="filter-select"
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    disabled={storesLoading}
                  >
                    <option value="">Hamısı</option>
                    {safeStores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="date-from">Başlanğıc tarix:</label>
                  <input
                    type="date"
                    id="date-from"
                    className="filter-input"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="date-to">Bitiş tarix:</label>
                  <input
                    type="date"
                    id="date-to"
                    className="filter-input"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <button
                    type="button"
                    className="clear-filters-button"
                    onClick={clearFilters}
                  >
                    Təmizlə
                  </button>
                </div>
              </div>

              <div className="today-controls">
                <button
                  type="button"
                  className={`today-button ${dateFrom === getTodayString() && dateTo === getTodayString() ? 'active' : ''}`}
                  onClick={handleTodayFilter}
                >
                  Bu gün
                </button>
                <div className="today-summary">
                  Toplam: {todayTotal.toLocaleString('az-AZ', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₼
                </div>
              </div>
            </div>

            {allOrdersError && <div className="error-message">{allOrdersError}</div>}
            {allOrdersLoading ? (
              <p>Yüklənir...</p>
            ) : searchedFilteredOrders.length === 0 ? (
              <p>Sifariş yoxdur.</p>
            ) : (
              renderOrdersTable(searchedFilteredOrders, { showTransfer: true })
            )}

            <div className="live-orders-section">
              <h2>Bütün sifarişlər (canlı)</h2>
              {renderOrdersTable(searchedAllOrders, { keyPrefix: 'live', showTransfer: true, showCancel: true })}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="order-list-container">
            <h2>Ödənişlər</h2>
            
            {/* Payment Filters */}
            <div className="filters-section">
              <div className="filter-row">
                <div className="filter-group">
                  <label htmlFor="payment-store-filter">Mağaza seç:</label>
                  <select
                    id="payment-store-filter"
                    className="filter-select"
                    value={paymentStoreFilter}
                    onChange={(e) => {
                      const nextStoreId = e.target.value;
                      setPaymentStoreFilter(nextStoreId);
                      setSelectedPaymentStoreId(nextStoreId || null);
                      setReceiptPayment(null);
                    }}
                    disabled={storesLoading}
                  >
                    <option value="">Hamısı</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="payment-date-from">Başlanğıc tarix:</label>
                  <input
                    type="date"
                    id="payment-date-from"
                    className="filter-input"
                    value={paymentDateFrom}
                    onChange={(e) => setPaymentDateFrom(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="payment-date-to">Bitiş tarix:</label>
                  <input
                    type="date"
                    id="payment-date-to"
                    className="filter-input"
                    value={paymentDateTo}
                    onChange={(e) => setPaymentDateTo(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="payment-status-filter">Status:</label>
                  <select
                    id="payment-status-filter"
                    className="filter-select"
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  >
                    <option value="">Hamısı</option>
                    <option value="pending">Gözləyir</option>
                    <option value="approved">Təsdiq edildi</option>
                    <option value="cancelled">Rədd edildi</option>
                  </select>
                </div>
              </div>

              <div className="filter-row">
                <div className="filter-group">
                  <label htmlFor="payment-min-amount">Min məbləğ:</label>
                  <input
                    type="number"
                    id="payment-min-amount"
                    className="filter-input"
                    value={paymentMinAmount}
                    onChange={(e) => setPaymentMinAmount(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="payment-max-amount">Max məbləğ:</label>
                  <input
                    type="number"
                    id="payment-max-amount"
                    className="filter-input"
                    value={paymentMaxAmount}
                    onChange={(e) => setPaymentMaxAmount(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="filter-group">
                  <button
                    type="button"
                    className="clear-filters-button"
                    onClick={clearPaymentFilters}
                  >
                    Təmizlə
                  </button>
                </div>

                <div className="filter-group">
                  <button
                    type="button"
                    className="today-button"
                    onClick={handlePaymentTodayFilter}
                  >
                    Bu gün
                  </button>
                </div>
              </div>
            </div>

            <div className="payment-summary-grid">
              {searchedStorePaymentSummary.length === 0 ? (
                <div className="order-status">Heç bir mağaza tapılmadı.</div>
              ) : (
                <div className="payment-summary-table">
                  <div className="table-row table-header">
                    <span>Mağaza</span>
                    <span>Ümumi sifariş məbləği</span>
                    <span>Ödənilib (₼)</span>
                    <span>Qalan borc (₼)</span>
                  </div>
                  {searchedStorePaymentSummary.map((store) => (
                    <button
                      key={store.id}
                      type="button"
                      className={`table-row table-row-button ${selectedPaymentStoreId === String(store.id) ? 'active-row' : ''}`}
                      onClick={() => {
                        if (!store?.id) {
                          return;
                        }

                        setSelectedPaymentStoreId(store.id);
                        setPaymentStoreFilter(String(store.id));
                        setReceiptPayment(null);
                      }}
                    >
                      <span>{store?.name || 'N/A'}</span>
                      <span>₼ {(store?.totalOrders || 0).toFixed(2)}</span>
                      <span>₼ {(store?.totalPaid || 0).toFixed(2)}</span>
                      <span>₼ {(store?.remaining || 0).toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedPaymentStore && (
              <div className="payment-detail-section">
                <div className="page-header">
                  <div>
                    <h2>{selectedPaymentStore?.name || 'N/A'} - Mağaza məlumatları</h2>
                    <p><strong>Telefon:</strong> {selectedPaymentStore?.phone || 'N/A'}</p>
                    <p><strong>Ünvan:</strong> {selectedPaymentStore?.address || 'N/A'}</p>
                  </div>
                  <button
                    type="button"
                    className="top-right-button"
                    onClick={() => {
                      if (!selectedPaymentStore) {
                        return;
                      }

                      setShowReceiptModal(true);
                    }}
                  >
                    Qəbz yarat
                  </button>
                </div>

                <div className="stats-container">
                  <div className="stats-card">
                    <h3>Ümumi sifariş məbləği</h3>
                    <p className="stats-value">₼ {(selectedStoreSummary?.totalOrders || 0).toFixed(2)}</p>
                  </div>
                  <div className="stats-card">
                    <h3>Ödənilib</h3>
                    <p className="stats-value">₼ {(selectedStoreSummary?.totalPaid || 0).toFixed(2)}</p>
                  </div>
                  <div className={`stats-card payable-card ${selectedStoreRemaining <= 0 ? 'debt-zero' : 'debt-positive'}`}>
                    <h3>Qalan borc</h3>
                    <p className="stats-value">₼ {(selectedStoreRemaining || 0).toFixed(2)}</p>
                  </div>
                </div>

                <div className="payments-section">
                  <h3>Gözləyən ödənişlər ({searchedSelectedStorePayments.filter((payment) => payment?.status === 'pending').length})</h3>
                  {searchedSelectedStorePayments.filter((payment) => payment?.status === 'pending').length === 0 ? (
                    <p>Gözləyən ödəniş yoxdur.</p>
                  ) : (
                    renderPaymentsList(
                      searchedSelectedStorePayments.filter((payment) => payment?.status === 'pending'),
                      'pending-payment'
                    )
                  )}

                  <h3>Ödəniş tarixçəsi ({searchedSelectedStorePayments.length} ödəniş)</h3>
                  {paymentsLoading ? (
                    <p>Ödənişlər yüklənir...</p>
                  ) : searchedSelectedStorePayments.length === 0 ? (
                    <p>No payments</p>
                  ) : (
                    renderPaymentsList(searchedSelectedStorePayments, 'payment-history')
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="report-container space-y-4 text-sm md:text-base">
            <h2 className="m-0 text-lg md:text-xl font-semibold text-slate-900">Hesabatlar</h2>
            <div className="report-top-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            <div className="filters-section report-filters-section rounded-xl shadow p-4 md:col-span-2 lg:col-span-2">
              <div className="section-header items-start gap-3">
                <div>
                  <h3 className="m-0 text-lg md:text-xl font-semibold text-slate-900">Filtrlər</h3>
                  <p className="section-note mt-1 text-xs">Hesabat məlumatlarını tarixə görə daralt.</p>
                </div>
                <div className="filter-buttons report-filter-buttons flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`filter-button ${reportFilterMode === 'today' ? 'active' : ''}`}
                    onClick={setTodayReportFilter}
                  >
                    Bu gün
                  </button>
                  <button
                    type="button"
                    className={`filter-button ${reportFilterMode === 'yesterday' ? 'active' : ''}`}
                    onClick={setYesterdayReportFilter}
                  >
                    Dünən
                  </button>
                  <button
                    type="button"
                    className={`filter-button ${reportFilterMode === 'range' ? 'active' : ''}`}
                    onClick={setRangeReportFilter}
                  >
                    Tarix aralığı
                  </button>
                </div>
              </div>

              <div className="filter-row grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="filter-group">
                  <label htmlFor="report-start-date">Başlanğıc tarix</label>
                  <input
                    id="report-start-date"
                    type="date"
                    className="filter-input h-10 md:h-11 px-3 py-2 text-sm"
                    value={reportStartDate}
                    onChange={(e) => {
                      setReportFilterMode('range');
                      setReportStartDate(e.target.value);
                    }}
                  />
                </div>
                <div className="filter-group">
                  <label htmlFor="report-end-date">Bitiş tarix</label>
                  <input
                    id="report-end-date"
                    type="date"
                    className="filter-input h-10 md:h-11 px-3 py-2 text-sm"
                    value={reportEndDate}
                    onChange={(e) => {
                      setReportFilterMode('range');
                      setReportEndDate(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="report-toolbar rounded-xl shadow p-4 md:col-span-2 lg:col-span-1">
              <div className="filter-row report-advanced-filters grid grid-cols-1 gap-4">
                <div className="filter-group">
                  <label htmlFor="report-store-filter">Mağaza</label>
                  <select
                    id="report-store-filter"
                    className="filter-select h-10 md:h-11 px-3 py-2 text-sm"
                    value={reportStoreFilter}
                    onChange={(e) => setReportStoreFilter(e.target.value)}
                  >
                    <option value="">Bütün mağazalar</option>
                    {safeStores.map((store) => (
                      <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label htmlFor="report-status-filter">Status</label>
                  <select
                    id="report-status-filter"
                    className="filter-select h-10 md:h-11 px-3 py-2 text-sm"
                    value={reportStatusFilter}
                    onChange={(e) => setReportStatusFilter(e.target.value)}
                  >
                    <option value="">Bütün statuslar</option>
                    <option value="delivered">Çatdırıldı</option>
                    <option value="pending">Gözləyir</option>
                    <option value="approved">Kuryerdə</option>
                    <option value="courier_cancelled">Kuryer ləğvi</option>
                    <option value="admin_cancelled">Admin ləğvi</option>
                    <option value="counted">Qazanca daxil olanlar</option>
                  </select>
                </div>
                <div className="filter-group report-action-group min-w-0 ml-0">
                  <label>Çıxarış</label>
                  <div className="report-action-buttons grid grid-cols-1 gap-2">
                    <button type="button" className="view-order-button" onClick={() => window.print()}>PDF çıxar</button>
                    <button type="button" className="view-order-button" onClick={() => exportReportCsv(detailedReportRows)}>Excel çıxar</button>
                    <button type="button" className="view-order-button" onClick={() => window.print()}>Çap et</button>
                  </div>
                </div>
              </div>
            </div>
            </div>

            <div className="report-cards report-premium-summary-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="report-card report-premium-card report-card-earnings rounded-xl shadow p-4 h-full flex flex-col gap-3">
                <div className="report-card-icon">₼</div>
                <h3 className="m-0 pr-10 text-sm md:text-base font-semibold text-slate-800">Ümumi gəlir</h3>
                <div className="report-value mt-0 text-lg md:text-xl">₼ {reportSummary.totalIncome.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="report-subvalue text-xs">Çatdırılanlar və kuryer ləğvləri daxildir</div>
              </div>
              <div className="report-card report-premium-card report-card-expenses rounded-xl shadow p-4 h-full flex flex-col gap-3">
                <div className="report-card-icon">−</div>
                <h3 className="m-0 pr-10 text-sm md:text-base font-semibold text-slate-800">Ümumi xərclər</h3>
                <div className="report-value report-value-expense mt-0 text-lg md:text-xl">₼ {reportSummary.totalExpenses.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="report-subvalue text-xs">Filtrə düşən xərclərin cəmi</div>
              </div>
              <div className="report-card report-premium-card report-card-profit rounded-xl shadow p-4 h-full flex flex-col gap-3">
                <div className="report-card-icon">⟰</div>
                <h3 className="m-0 pr-10 text-sm md:text-base font-semibold text-slate-800">Son qazanc</h3>
                <div className="report-value report-value-profit mt-0 text-lg md:text-xl">₼ {reportSummary.netProfit.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="report-subvalue text-xs">Gəlir − xərclər</div>
              </div>
              <div className="report-card report-premium-card report-card-orders rounded-xl shadow p-4 h-full flex flex-col gap-3">
                <div className="report-card-icon">#</div>
                <h3 className="m-0 pr-10 text-sm md:text-base font-semibold text-slate-800">Ümumi sifariş sayı</h3>
                <div className="report-value mt-0 text-lg md:text-xl">{reportSummary.totalOrders.toLocaleString('az-AZ')}</div>
                <div className="report-subvalue text-xs">Filtrlənmiş nəticə</div>
              </div>
              <div className="report-card report-premium-card report-card-delivered rounded-xl shadow p-4 h-full flex flex-col gap-3">
                <div className="report-card-icon">✓</div>
                <h3 className="m-0 pr-10 text-sm md:text-base font-semibold text-slate-800">Çatdırılan sifarişlər</h3>
                <div className="report-value mt-0 text-lg md:text-xl">{reportSummary.deliveredOrders.toLocaleString('az-AZ')}</div>
                <div className="report-subvalue text-xs">Tamamlanan sifarişlər</div>
              </div>
              <div className="report-card report-premium-card report-card-courier-cancel rounded-xl shadow p-4 h-full flex flex-col gap-3">
                <div className="report-card-icon">↺</div>
                <h3 className="m-0 pr-10 text-sm md:text-base font-semibold text-slate-800">Kuryer ləğv</h3>
                <div className="report-value mt-0 text-lg md:text-xl">{reportSummary.courierCancelledOrders.toLocaleString('az-AZ')}</div>
                <div className="report-subvalue text-xs">₼ {reportSummary.courierCancelledTotal.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="report-card report-premium-card report-card-admin-cancel rounded-xl shadow p-4 h-full flex flex-col gap-3">
                <div className="report-card-icon">✕</div>
                <h3 className="m-0 pr-10 text-sm md:text-base font-semibold text-slate-800">Admin ləğv</h3>
                <div className="report-value mt-0 text-lg md:text-xl">{reportSummary.adminCancelledOrders.toLocaleString('az-AZ')}</div>
                <div className="report-subvalue text-xs">₼ {reportSummary.adminCancelledTotal.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="report-card report-premium-card report-card-debt rounded-xl shadow p-4 h-full flex flex-col gap-3">
                <div className="report-card-icon">◎</div>
                <h3 className="m-0 pr-10 text-sm md:text-base font-semibold text-slate-800">Aktiv borc</h3>
                <div className="report-value mt-0 text-lg md:text-xl">₼ {reportActiveDebt.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="report-subvalue text-xs">Mağazalardan qalan borc</div>
              </div>
            </div>

            {activeReportOrders.length === 0 ? (
              <div className="report-section report-empty-state rounded-xl shadow p-4">
                <h3 className="m-0 text-lg md:text-xl font-semibold text-slate-900">Məlumat yoxdur</h3>
                <p className="mt-2 text-sm md:text-base">Seçilmiş tarix aralığında hesabat məlumatı tapılmadı.</p>
              </div>
            ) : (
              <div className="report-data-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                <div className="report-analytics-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:col-span-3">
                  <div className="report-section report-analytics-card rounded-xl shadow p-4">
                    <div className="section-header items-start gap-3">
                      <div>
                        <h3 className="m-0 text-lg md:text-xl font-semibold text-slate-900">Gündəlik qazanc</h3>
                        <p className="section-note mt-1 text-xs">Filtrə uyğun gündəlik gəlir dinamikası.</p>
                      </div>
                      <div className="report-meta-chip text-xs">Maksimum: ₼ {lineChartMaxIncome.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div className="report-line-chart-shell mt-4">
                      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="report-line-chart">
                        <polyline className="report-line-chart-path" fill="none" points={lineChartPoints || '0,100 100,100'} />
                      </svg>
                      <div className="report-line-labels">
                        {lineChartData.map((item) => (
                          <div key={item.date} className="report-line-label-item">
                            <span>{item.date}</span>
                            <strong>₼ {item.income.toLocaleString('az-AZ', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="report-section report-analytics-card rounded-xl shadow p-4">
                    <div className="section-header items-start gap-3">
                      <div>
                        <h3 className="m-0 text-lg md:text-xl font-semibold text-slate-900">Mağazalara görə qazanc</h3>
                        <p className="section-note mt-1 text-xs">Ən çox qazanc gətirən mağazalar.</p>
                      </div>
                    </div>
                    <div className="report-bar-chart mt-4">
                      {topStoreChartData.map((item) => (
                        <div key={item.storeId} className="report-bar-row">
                          <div className="report-bar-meta">
                            <span>{item.storeName}</span>
                            <strong>₼ {item.totalEarnings.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                          </div>
                          <div className="report-bar-track-wide">
                            <div className="report-bar-fill-wide" style={{ width: `${Math.max((item.totalEarnings / topStoreChartMax) * 100, 4)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="report-section report-analytics-card rounded-xl shadow p-4">
                    <div className="section-header items-start gap-3">
                      <div>
                        <h3 className="m-0 text-lg md:text-xl font-semibold text-slate-900">Statuslara görə sifariş</h3>
                        <p className="section-note mt-1 text-xs">Çatdırıldı, ləğv və gözləyən bölgüsü.</p>
                      </div>
                    </div>
                    <div className="report-pie-layout mt-4">
                      <div className="report-pie-chart" style={{ background: statusPieGradient }} />
                      <div className="report-pie-legend">
                        {statusChartData.map((item) => (
                          <div key={item.label} className="report-pie-legend-item">
                            <span className="report-pie-swatch" style={{ background: item.color }} />
                            <span>{item.label}</span>
                            <strong>{item.count}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="report-section rounded-xl shadow p-4 md:col-span-2 lg:col-span-2">
                  <div className="section-header items-start gap-3">
                    <div>
                      <h3 className="m-0 text-lg md:text-xl font-semibold text-slate-900">Mağaza üzrə nəticələr</h3>
                      <p className="section-note mt-1 text-xs">Hər mağaza üçün sifariş, çatdırılma, ləğv və gəlir göstəriciləri.</p>
                    </div>
                    <div className="report-meta-chip text-xs">Xərc: ₼ {reportSummary.totalExpenses.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                  <div className="report-table mt-4">
                    <div className="report-row report-row-6 report-row-header">
                      <span>Mağaza</span>
                      <span>Ümumi sifarişlər</span>
                      <span>Çatdırıldı</span>
                      <span>Kuryer ləğvi</span>
                      <span>Admin ləğvi</span>
                      <span>Qazanc</span>
                    </div>
                    {storeGroupedReport.map((item) => (
                      <div key={item.storeId} className="report-row report-row-6 report-row-emphasis">
                        <span data-label="Mağaza">{item.storeName}</span>
                        <span data-label="Ümumi sifarişlər">{item.totalOrders}</span>
                        <span data-label="Çatdırıldı" className="report-number-positive">{item.deliveredOrders}</span>
                        <span data-label="Kuryer ləğvi" className="report-number-positive">{item.courierCancelledOrders}</span>
                        <span data-label="Admin ləğvi" className="report-number-negative">{item.adminCancelledOrders}</span>
                        <span data-label="Qazanc">₼ {item.totalEarnings.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="report-section rounded-xl shadow p-4">
                  <h3 className="m-0 text-lg md:text-xl font-semibold text-slate-900">Gündəlik hesabat</h3>
                  <div className="report-table mt-4">
                    <div className="report-row report-row-5 report-row-header">
                      <span>Tarix</span>
                      <span>Sifariş sayı</span>
                      <span>Kuryer ləğvi</span>
                      <span>Admin ləğvi</span>
                      <span>Gəlir</span>
                    </div>
                    {dailyReport.map((item) => (
                      <div key={item.date} className="report-row report-row-5">
                        <span data-label="Tarix">{item.date}</span>
                        <span data-label="Sifariş sayı">{item.count}</span>
                        <span data-label="Kuryer ləğvi">{item.courierCancelledOrders}</span>
                        <span data-label="Admin ləğvi">{item.adminCancelledOrders}</span>
                        <span data-label="Gəlir">₼ {item.income.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="report-section rounded-xl shadow p-4">
                  <h3 className="m-0 text-lg md:text-xl font-semibold text-slate-900">Aylıq hesabat</h3>
                  <div className="report-table mt-4">
                    <div className="report-row report-row-5 report-row-header">
                      <span>Ay</span>
                      <span>Sifariş sayı</span>
                      <span>Kuryer ləğvi</span>
                      <span>Admin ləğvi</span>
                      <span>Gəlir</span>
                    </div>
                    {monthlyReport.map((item) => (
                      <div key={`${item.year}-${item.month}`} className="report-row report-row-5">
                        <span data-label="Ay">{item.month} {item.year}</span>
                        <span data-label="Sifariş sayı">{item.count}</span>
                        <span data-label="Kuryer ləğvi">{item.courierCancelledOrders}</span>
                        <span data-label="Admin ləğvi">{item.adminCancelledOrders}</span>
                        <span data-label="Gəlir">₼ {item.income.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="report-section rounded-xl shadow p-4 md:col-span-2 lg:col-span-2">
                  <div className="section-header items-start gap-3">
                    <div>
                      <h3 className="m-0 text-lg md:text-xl font-semibold text-slate-900">Detallı hesabat siyahısı</h3>
                      <p className="section-note mt-1 text-xs">Bütün filtrlənmiş sifarişlərin maliyyə və status görünüşü.</p>
                    </div>
                  </div>
                  <div className="report-table detail-report-table mt-4">
                    <div className="report-row report-row-5 report-row-header">
                      <span>Tarix</span>
                      <span>Mağaza</span>
                      <span>Məbləğ</span>
                      <span>Status</span>
                      <span>Kim ləğv edib</span>
                    </div>
                    {detailedReportRows.map((order) => (
                      <div key={`report-detail-${order.id}`} className="report-row report-row-5 report-row-emphasis">
                        <span data-label="Tarix">{formatDisplayDate(order.createdAt)}</span>
                        <span data-label="Mağaza">{order.storeName || 'Naməlum mağaza'}</span>
                        <span data-label="Məbləğ">₼ {getOrderFinancialAmount(order).toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span data-label="Status">{getReportStatusLabel(order)}</span>
                        <span data-label="Kim ləğv edib">{getCancelledByPersonLabel(order)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="report-expense-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            <div className="report-section rounded-xl shadow p-4">
              <h3 className="m-0 text-lg md:text-xl font-semibold text-slate-900">Xərc əlavə et</h3>
              <form className="expense-form" onSubmit={handleAddExpense}>
                <div className="form-row mt-4">
                  <div className="form-group">
                    <label htmlFor="expense-amount">Məbləğ</label>
                    <input
                      id="expense-amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      value={expenseForm.amount}
                      onChange={handleExpenseChange}
                      className="form-input h-10 md:h-11 px-3 py-2 text-sm"
                      placeholder="Məbləği daxil edin"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="expense-title">Başlıq</label>
                    <input
                      id="expense-title"
                      name="title"
                      type="text"
                      value={expenseForm.title}
                      onChange={handleExpenseChange}
                      className="form-input h-10 md:h-11 px-3 py-2 text-sm"
                      placeholder="Xərc başlığını yazın"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="expense-date">Tarix</label>
                    <input
                      id="expense-date"
                      name="date"
                      type="date"
                      value={expenseForm.date}
                      onChange={handleExpenseChange}
                      className="form-input h-10 md:h-11 px-3 py-2 text-sm"
                      required
                    />
                  </div>
                </div>
                {expenseError && <div className="error-message">{expenseError}</div>}
                <button type="submit" className="order-button mt-4" disabled={expenseLoading}>
                  Xərc əlavə et
                </button>
              </form>
            </div>

            <div className="report-section rounded-xl shadow p-4 md:col-span-2 lg:col-span-2">
              <h3 className="m-0 text-lg md:text-xl font-semibold text-slate-900">Xərc siyahısı</h3>
              <div className="expense-table mt-4">
                <div className="report-row report-row-header">
                  <span>Məbləğ</span>
                  <span>Başlıq</span>
                  <span>Tarix</span>
                      <span>Əməliyyat</span>
                </div>
                {reportExpenses.map((item) => (
                  <div key={item.id} className="report-row report-row-4 expense-row">
                    <span data-label="Məbləğ">₼ {parseFloat(item.amount).toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span data-label="Başlıq">{item.title || item.reason}</span>
                    <span data-label="Tarix">{formatDisplayDate(item.date)}</span>
                    <span data-label="Əməliyyat" className="expense-delete-cell">
                      <button
                        type="button"
                        className="delete-button expense-delete-button"
                        onClick={() => handleDeleteExpense(item.id)}
                      >
                        Sil
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>
        )}

        {activeTab === 'couriers' && (
          <div className="order-list-container">
            <div className="page-header">
              <h2>Kuryerlər</h2>
              <button className="top-right-button" onClick={() => setActiveTab('courier')}>
                ➕ Kuryer əlavə et
              </button>
            </div>
            {(couriersLoading || allOrdersLoading) ? (
              <p>Yüklənir...</p>
            ) : couriers.length === 0 ? (
              <p>Heç bir kuryer tapılmadı.</p>
            ) : (
              renderCourierList()
            )}
          </div>
        )}

        {activeTab === 'stores' && (
          <div className="order-list-container">
            <div className="page-header">
              <h2>Mağazalar</h2>
              <button className="top-right-button" onClick={() => setActiveTab('store')}>
                ➕ Mağaza əlavə et
              </button>
            </div>
            {(storesLoading || allOrdersLoading) ? (
              <p>Yüklənir...</p>
            ) : stores.length === 0 ? (
              <p>Heç bir mağaza tapılmadı.</p>
            ) : (
              renderStoreList()
            )}
          </div>
        )}

        {activeTab === 'store' && (
          <div className="form-container">
            <h2>Yeni Mağaza Əlavə Et</h2>
            <form onSubmit={handleAddStore} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="store-name">Mağaza Adı:</label>
                  <input
                    type="text"
                    id="store-name"
                    name="name"
                    value={storeForm.name}
                    onChange={handleStoreChange}
                    placeholder="Mağaza adını daxil edin"
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="store-code">Kod:</label>
                  <input
                    type="text"
                    id="store-code"
                    name="code"
                    value={storeForm.code}
                    onChange={handleStoreChange}
                    placeholder="Unikal kod"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="store-phone">Telefon:</label>
                  <input
                    type="tel"
                    id="store-phone"
                    name="phone"
                    value={storeForm.phone}
                    onChange={handleStoreChange}
                    placeholder="+994..."
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="store-address">Ünvan:</label>
                  <input
                    type="text"
                    id="store-address"
                    name="address"
                    value={storeForm.address}
                    onChange={handleStoreChange}
                    placeholder="Ünvan"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="store-metro">Metro Qiyməti (₼):</label>
                  <input
                    type="number"
                    id="store-metro"
                    name="metroPrice"
                    value={storeForm.metroPrice}
                    onChange={handleStoreChange}
                    placeholder="0"
                    required
                    className="form-input"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="store-outside">Xaric Qiyməti (₼):</label>
                  <input
                    type="number"
                    id="store-outside"
                    name="outsidePrice"
                    value={storeForm.outsidePrice}
                    onChange={handleStoreChange}
                    placeholder="0"
                    required
                    className="form-input"
                    min="0"
                  />
                </div>
              </div>

              {storeError && <div className="error-message">{storeError}</div>}

              <button 
                type="submit" 
                className="submit-button"
                disabled={storeLoading}
              >
                {storeLoading ? 'Yüklənir...' : 'Mağaza Əlavə Et'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'courier' && (
          <div className="form-container">
            <h2>Yeni Kuryer Əlavə Et</h2>
            <form onSubmit={handleAddCourier} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="courier-name">Kuryer Adı:</label>
                  <input
                    type="text"
                    id="courier-name"
                    name="name"
                    value={courierForm.name}
                    onChange={handleCourierChange}
                    placeholder="Kuryer adını daxil edin"
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="courier-code">Kod:</label>
                  <input
                    type="text"
                    id="courier-code"
                    name="code"
                    value={courierForm.code}
                    onChange={handleCourierChange}
                    placeholder="Unikal kod"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="courier-phone">Telefon:</label>
                  <input
                    type="tel"
                    id="courier-phone"
                    name="phone"
                    value={courierForm.phone}
                    onChange={handleCourierChange}
                    placeholder="+994..."
                    required
                    className="form-input"
                  />
                </div>
              </div>

              {courierError && <div className="error-message">{courierError}</div>}

              <button 
                type="submit" 
                className="submit-button"
                disabled={courierLoading}
              >
                {courierLoading ? 'Yüklənir...' : 'Kuryer Əlavə Et'}
              </button>
            </form>
          </div>
        )}
          </div>
        </div>
      </div>

      {openOrder && (
        <div className="modal-overlay" onClick={closeOrderDetails}>
          <div className="receipt-modal order-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-header order-details-header">
              <h2>Sifariş #{getOrderIdValue(openOrder)}</h2>
              <button
                type="button"
                className="close-button"
                onClick={closeOrderDetails}
              >
                ×
              </button>
            </div>

            <div className="receipt-content order-details-content-modal">
              <div className="receipt-info order-modal-grid">
                <div className="info-section">
                  <h3>Müştəri</h3>
                  <div className="info-row">
                    <span className="info-label">Ad:</span>
                    <span className="info-value">{openOrder.customerName || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Telefon:</span>
                    <span className="info-value">{openOrder.customerPhone || openOrder.phone || 'N/A'}</span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Çatdırılma</h3>
                  <div className="info-row">
                    <span className="info-label">Növ:</span>
                    <span className="info-value">{getOrderDeliveryLabel(openOrder)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Ünvan:</span>
                    <span className="info-value">{openOrder.address || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Tarix:</span>
                    <span className="info-value">{getOrderSummaryDate(openOrder)}</span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Kuryer və mağaza</h3>
                  <div className="info-row">
                    <span className="info-label">Mağaza:</span>
                    <span className="info-value">{openOrder.storeName || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Kuryer:</span>
                    <span className="info-value">{getCourierName(openOrder.courierId, openOrder.courierName)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Telefon:</span>
                    <span className="info-value">{openOrder.storePhone || 'N/A'}</span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Tam məlumat</h3>
                  <div className="info-row">
                    <span className="info-label">Status:</span>
                    <span className="info-value">{renderStatusBadge(openOrder.status)}</span>
                  </div>
                  {isCancelledStatus(openOrder.status) && (
                    <div className="info-row">
                      <span className="info-label">Kim ləğv etdi:</span>
                      <span className="info-value">{openOrder.cancelledBy || 'Naməlum'}</span>
                    </div>
                  )}
                  {isCancelledStatus(openOrder.status) && (
                    <div className="info-row">
                      <span className="info-label">Ləğv səbəbi:</span>
                      <span className="info-value">{openOrder.cancelReason || 'Səbəb qeyd edilməyib'}</span>
                    </div>
                  )}
                  {isCancelledStatus(openOrder.status) && (
                    <div className="info-row">
                      <span className="info-label">Ləğv növü:</span>
                      <span className="info-value">{getCancelledByLabel(openOrder)}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">Məbləğ:</span>
                    <span className="info-value amount">{formatOrderAmount(openOrder.price)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Vaxt:</span>
                    <span className="info-value">{openOrder.time || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Qeyd:</span>
                    <span className="info-value">{openOrder.note || 'Yoxdur'}</span>
                  </div>
                </div>
              </div>

              {openOrderOptions.showAssignment && (
                <div className="courier-selection compact-courier-selection order-modal-actions">
                  <label><strong>Kuryer seçin:</strong></label>
                  <select
                    className="courier-select"
                    value={getOrderSelectedCourier(openOrder)}
                    onChange={(e) => handleSelectCourier(openOrder.id, e.target.value)}
                    disabled={couriersLoading}
                  >
                    <option value="">Kuryer seçin</option>
                    {couriers.map((courier) => (
                      <option key={courier.id} value={courier.id}>
                        {courier.name} ({courier.code})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="assign-button"
                    onClick={() => (openOrder.courierId ? handleReassignOrder(openOrder.id) : handleAssignCourier(openOrder.id))}
                    disabled={openOrder.courierId
                      ? !selectedCouriers[openOrder.id] || String(selectedCouriers[openOrder.id]) === String(openOrder.courierId) || couriersLoading
                      : !selectedCouriers[openOrder.id] || couriersLoading}
                  >
                    {openOrder.courierId ? 'Təyinatı dəyişdir' : 'Kuryer təyin et'}
                  </button>
                </div>
              )}

              {openOrderOptions.showTransfer && Boolean(openOrder.courierId) && (
                <div className="courier-selection compact-courier-selection order-modal-actions">
                  <label><strong>Kuryer seçin:</strong></label>
                  <select
                    className="courier-select"
                    value={getOrderSelectedCourier(openOrder)}
                    onChange={(e) => handleSelectCourier(openOrder.id, e.target.value)}
                    disabled={couriersLoading}
                  >
                    <option value="">Kuryer seçin</option>
                    {couriers.map((courier) => (
                      <option key={courier.id} value={courier.id}>
                        {courier.name} ({courier.code})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="assign-button"
                    onClick={() => handleTransferOrder(openOrder.id, openOrder.courierId)}
                    disabled={!selectedCouriers[openOrder.id] || String(selectedCouriers[openOrder.id]) === String(openOrder.courierId) || couriersLoading}
                  >
                    Başqa kuryere təhvil ver
                  </button>
                </div>
              )}

              {openOrderOptions.showCancel && !isCancelledStatus(openOrder.status) && openOrder.status !== 'delivered' && (
                <div className="order-actions order-modal-actions-footer">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => handleCancelOrder(openOrder.id)}
                  >
                    Sifarişi ləğv et
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {destructiveAction.isOpen && (() => {
        const actionConfig = getDestructiveActionConfig(destructiveAction.actionType);

        return (
          <div className="modal-overlay" onClick={closeDestructiveActionModal}>
            <div className="receipt-modal destructive-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="receipt-header destructive-confirm-header">
                <h2>{actionConfig.title}</h2>
                <button
                  type="button"
                  className="close-button"
                  onClick={closeDestructiveActionModal}
                >
                  ✕
                </button>
              </div>

              <div className="receipt-content destructive-confirm-content">
                {destructiveAction.step === 1 && (
                  <div className="destructive-confirm-step">
                    <p>{actionConfig.firstPrompt}</p>
                  </div>
                )}

                {destructiveAction.step === 2 && (
                  <div className="destructive-confirm-step">
                    <p>{actionConfig.secondPrompt}</p>
                  </div>
                )}

                {destructiveAction.step === 3 && (
                  <div className="destructive-confirm-step">
                    <label className="destructive-confirm-label" htmlFor="admin-code-confirmation">
                      {actionConfig.codePrompt}
                    </label>
                    <input
                      id="admin-code-confirmation"
                      type="password"
                      className="form-input destructive-confirm-input"
                      value={destructiveAction.adminCode}
                      onChange={(e) => handleDestructiveActionInput('adminCode', e.target.value)}
                      placeholder="Admin kodu"
                    />
                    {destructiveAction.codeError && (
                      <div className="error-message destructive-confirm-message">
                        {destructiveAction.codeError}
                      </div>
                    )}
                  </div>
                )}

                {destructiveAction.step === 4 && (
                  <div className="destructive-confirm-step">
                    <p>Son təsdiq üçün düyməni basın.</p>
                    {actionConfig.requiresReason && (
                      <div className="destructive-confirm-reason-group">
                        <label className="destructive-confirm-label" htmlFor="destructive-action-reason">
                          Ləğv səbəbi
                        </label>
                        <textarea
                          id="destructive-action-reason"
                          className="form-input destructive-confirm-textarea"
                          value={destructiveAction.reason}
                          onChange={(e) => handleDestructiveActionInput('reason', e.target.value)}
                          placeholder="Ləğv səbəbini yazın"
                        />
                      </div>
                    )}
                    {destructiveAction.actionError && (
                      <div className="error-message destructive-confirm-message">
                        {destructiveAction.actionError}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="receipt-actions destructive-confirm-actions">
                <button
                  type="button"
                  className="close-modal-button"
                  onClick={closeDestructiveActionModal}
                  disabled={destructiveAction.isSubmitting}
                >
                  Ləğv et
                </button>

                {destructiveAction.step === 1 && (
                  <button
                    type="button"
                    className="delete-button destructive-confirm-primary"
                    onClick={advanceDestructiveActionStep}
                  >
                    Bəli
                  </button>
                )}

                {destructiveAction.step === 2 && (
                  <button
                    type="button"
                    className="delete-button destructive-confirm-primary"
                    onClick={advanceDestructiveActionStep}
                  >
                    Davam et
                  </button>
                )}

                {destructiveAction.step === 3 && (
                  <button
                    type="button"
                    className="delete-button destructive-confirm-primary"
                    onClick={verifyDestructiveActionCode}
                    disabled={destructiveAction.isSubmitting}
                  >
                    {destructiveAction.isSubmitting ? 'Yoxlanılır...' : 'Davam et'}
                  </button>
                )}

                {destructiveAction.step === 4 && (
                  <button
                    type="button"
                    className="delete-button destructive-confirm-primary"
                    onClick={executeDestructiveAction}
                    disabled={destructiveAction.isSubmitting}
                  >
                    {destructiveAction.isSubmitting ? 'Təsdiqlənir...' : actionConfig.finalButtonLabel}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {showReceiptModal && receiptPayment && receiptStore && (
        <div className="modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-header">
              <h2>Kargo System</h2>
              <button
                type="button"
                className="close-button"
                onClick={() => setShowReceiptModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="receipt-content" id="receipt-print">
              <div className="receipt-title">
                <h1>Ödəniş Qəbzi</h1>
              </div>

              <div className="receipt-info">
                <div className="info-section">
                  <h3>Mağaza Məlumatları</h3>
                  <div className="info-row">
                    <span className="info-label">Ad:</span>
                    <span className="info-value">{receiptStore?.name || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Telefon:</span>
                    <span className="info-value">{receiptStore?.phone || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Ünvan:</span>
                    <span className="info-value">{receiptStore?.address || 'N/A'}</span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Ödəniş Məlumatları</h3>
                  <div className="info-row">
                    <span className="info-label">Məbləğ:</span>
                    <span className="info-value amount">₼ {(parseFloat(receiptPayment?.amount) || 0).toFixed(2)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Tarix:</span>
                    <span className="info-value">{receiptPayment?.createdAt ? new Date(receiptPayment.createdAt).toLocaleDateString('az-AZ') : 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Ödəniş ID:</span>
                    <span className="info-value">{receiptPayment?.id || 'N/A'}</span>
                  </div>
                  {receiptPayment?.note && (
                    <div className="info-row">
                      <span className="info-label">Qeyd:</span>
                      <span className="info-value">{receiptPayment.note}</span>
                    </div>
                  )}
                </div>
              </div>

              {getPaymentReceiptUrl(receiptPayment) && (
                <div className="receipt-image">
                  <h3>Qəbz Faylı</h3>
                  {isImageReceiptUrl(getPaymentReceiptUrl(receiptPayment)) ? (
                    <img
                      src={getPaymentReceiptUrl(receiptPayment)}
                      alt="Ödəniş çeki"
                      className="receipt-img"
                      style={{ cursor: 'pointer' }}
                      onClick={() => openImageZoom(getPaymentReceiptUrl(receiptPayment))}
                      onError={() => {
                        const errorKey = getPaymentReceiptKey(receiptPayment);
                        setReceiptOpenErrors((prev) => ({ ...prev, [errorKey]: 'Fayl açıla bilmədi' }));
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      className="view-order-button"
                      onClick={() => openReceiptInNewTab(receiptPayment)}
                    >
                      Qəbzi aç
                    </button>
                  )}
                  {receiptOpenErrors[getPaymentReceiptKey(receiptPayment)] && (
                    <div className="error-message">{receiptOpenErrors[getPaymentReceiptKey(receiptPayment)]}</div>
                  )}
                </div>
              )}

              <div className="receipt-footer">
                <p>Bu qəbz sistem tərəfindən avtomatik yaradılmışdır.</p>
                <p className="date-stamp">Tarix: {new Date().toLocaleDateString('az-AZ')} {new Date().toLocaleTimeString('az-AZ')}</p>
              </div>
            </div>

            <div className="receipt-actions">
              <button
                type="button"
                className="print-button"
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  const printContent = document.getElementById('receipt-print').innerHTML;
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Ödəniş Qəbzi</title>
                        <style>
                          body { font-family: Arial, sans-serif; margin: 20px; }
                          .receipt-title { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #667eea; padding-bottom: 15px; }
                          .receipt-title h1 { color: #333; font-size: 28px; font-weight: 700; margin: 0; }
                          .receipt-info { display: grid; gap: 25px; margin-bottom: 25px; }
                          .info-section { background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; }
                          .info-section h3 { margin: 0 0 15px 0; color: #667eea; font-size: 16px; font-weight: 600; }
                          .info-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding: 5px 0; }
                          .info-row:last-child { margin-bottom: 0; }
                          .info-label { font-weight: 600; color: #555; min-width: 80px; }
                          .info-value { text-align: right; color: #333; font-weight: 500; }
                          .info-value.amount { font-size: 18px; font-weight: 700; color: #28a745; }
                          .receipt-image { text-align: center; margin-bottom: 25px; }
                          .receipt-image h3 { margin: 0 0 15px 0; color: #667eea; font-size: 16px; font-weight: 600; }
                          .receipt-img { max-width: 100%; max-height: 200px; border: 1px solid #ddd; border-radius: 8px; }
                          .receipt-footer { text-align: center; border-top: 1px solid #e0e0e0; padding-top: 20px; color: #666; font-size: 12px; }
                          .receipt-footer p { margin: 5px 0; }
                          .date-stamp { font-weight: 600; color: #333; }
                        </style>
                      </head>
                      <body>
                        ${printContent}
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.print();
                }}
              >
                Çap et
              </button>
              <button
                type="button"
                className="close-modal-button"
                onClick={() => setShowReceiptModal(false)}
              >
                Bağla
              </button>
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
  );
}

export default AdminDashboard;
