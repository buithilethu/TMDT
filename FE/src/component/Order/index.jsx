import React, { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import dayjs from 'dayjs';
import { url } from '../data.js';
import './style.css';
import Header from '../HomePage/Header/index.jsx';
import Footer from '../HomePage/Footer/index.jsx';

const InvoicePage = () => {
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null);
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Invoice_${order?.orderCode}`,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${url}/v1/orders`, { credentials: 'include' });
        const json = await res.json();
        setOrders(json.data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }
    };

    fetchData();
  }, []);

  const viewOrderDetails = (orderCode) => {
    const selectedOrder = orders.find(o => o.orderCode === orderCode);
    setOrder(selectedOrder);
  };

  const goBack = () => {
    setOrder(null);
  };

  // Nếu không có đơn hàng nào
  if (orders.length === 0) {
    return <div className="p-4 text-center">Không có hóa đơn nào</div>;
  }

  // Nếu không có orderCode hoặc không tìm thấy hóa đơn
  if (!order) {
    return (
      <div>
        <Header />
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Danh Sách Hóa Đơn</h1>
          <table className="w-full border border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Mã đơn hàng</th>
                <th className="border p-2">Ngày tạo</th>
                <th className="border p-2">Trạng thái</th>
                <th className="border p-2">Tên sản phẩm</th>
                <th className="border p-2">Tổng tiền</th>
                <th className="border p-2">Xem chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.orderCode} className={o.status === 'paid' ? 'bg-green-100' : 'bg-red-100'}>
                  <td className="border p-2">{o.orderCode}</td>
                  <td className="border p-2">{dayjs(o.createdAt).format('DD/MM/YYYY HH:mm')}</td>
                  <td className="border p-2 text-center">
                    <span className={o.status === 'paid' ? 'text-green-600' : 'text-red-600'}>
                      {o.status}
                    </span>
                  </td>
                  <td className="border p-2">
                    {o.items.map(item => item.product.name).join(', ')}
                  </td>
                  <td className="border p-2 text-right">
                    {o.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}₫
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => viewOrderDetails(o.orderCode)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Footer />
      </div>

    );
  }

  // Nếu có orderCode và tìm thấy hóa đơn
  return (
    <div>
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <div ref={printRef} className="bg-white text-black p-6 rounded-2xl shadow-lg border">
          <h1 className="text-2xl font-bold text-center mb-6">HÓA ĐƠN THANH TOÁN</h1>

          <div className="mb-4 text-sm">
            <p><strong>Mã đơn hàng:</strong> {order.orderCode}</p>
            <p><strong>Ngày tạo:</strong> {dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}</p>
            <p><strong>Trạng thái:</strong> {order.status}</p>
          </div>

          <div className="mb-4 text-sm">
            <h2 className="text-lg font-semibold mb-1">Thông tin giao hàng</h2>
            <p><strong>Họ tên:</strong> {order.shipping.fullName}</p>
            <p><strong>Điện thoại:</strong> {order.shipping.phone}</p>
            <p><strong>Địa chỉ:</strong> {order.shipping.address}</p>
            <p><strong>Trạng thái giao hàng:</strong> {order.shipping.status}</p> {/* Trạng thái giao hàng */}
          </div>

          <div className="text-sm">
            <h2 className="text-lg font-semibold mb-2">Chi tiết đơn hàng</h2>
            <table className="w-full border border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">#</th>
                  <th className="border p-2 text-left">Tên sản phẩm</th>
                  <th className="border p-2">Màu sắc</th>
                  <th className="border p-2">Số lượng</th>
                  <th className="border p-2">Đơn giá</th>
                  <th className="border p-2">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={item.variant._id}>
                    <td className="border p-2 text-center">{i + 1}</td>
                    <td className="border p-2">{item.product.name}</td>
                    <td className="border p-2">{item.variant.attributes["Màu sắc"]}</td>
                    <td className="border p-2 text-center">{item.quantity}</td>
                    <td className="border p-2 text-right">{item.price.toLocaleString()}₫</td>
                    <td className="border p-2 text-right">{(item.price * item.quantity).toLocaleString()}₫</td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td colSpan="5" className="border p-2 text-right">Tổng cộng:</td>
                  <td className="border p-2 text-right">
                    {order.items.reduce((sum, item) => sum + item.quantity * item.price, 0).toLocaleString()}₫
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={goBack}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>

  );
};

export default InvoicePage;
