import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../HomePage/Header';
import Footer from '../HomePage/Footer';
import { url } from '../data.js';
import './style.css';

const SetupProfile = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    gender: 'male',
    dob: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);

  // Tỉnh, quận, phường
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');



  // Lấy danh sách tỉnh từ API
  useEffect(() => {
    axios
      .get('https://provinces.open-api.vn/api/p')
      .then((response) => setProvinces(response.data))
      .catch((error) => console.error('Error fetching provinces:', error));
  }, []);

  // Lấy danh sách quận khi tỉnh thay đổi
  useEffect(() => {
    if (selectedProvince) {
      axios
        .get(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then((response) => setDistricts(response.data.districts))
        .catch((error) => console.error('Error fetching districts:', error));
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvince]);

  // Lấy danh sách phường khi quận thay đổi
  useEffect(() => {
    if (selectedDistrict) {
      axios
        .get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then((response) => setWards(response.data.wards))
        .catch((error) => console.error('Error fetching wards:', error));
    } else {
      setWards([]);
    }
  }, [selectedDistrict]);

  // Lấy thông tin profile người dùng nếu đã có
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${url}/v1/profile`, {
          withCredentials: true,
        });
        if (res.data) {
          const profile = res.data.result;
          const address = profile.address;
          setFormData({
            fullName: profile.fullName || '',
            phone: profile.phone || '',
            gender: profile.gender || 'male',
            dob: profile.dob ? profile.dob.substring(0, 10) : '',
            address: address || '',
          });
          setHasProfile(true);
        }
      } catch (err) {
        // Nếu không có profile thì vẫn tiếp tục
      }
    };

    fetchProfile();
  }, []);

  // Cập nhật địa chỉ khi tỉnh/quận/phường thay đổi
  useEffect(() => {
    const province = provinces.find((p) => p.code === selectedProvince);
    const district = districts.find((d) => d.code === selectedDistrict);
    const ward = wards.find((w) => w.code === selectedWard);

    const addressParts = [];
    if (ward) addressParts.push(ward.name);
    if (district) addressParts.push(district.name);
    if (province) addressParts.push(province.name);

    // Update the address field in formData

  }, [selectedProvince, selectedDistrict, selectedWard, provinces, districts, wards]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const province = provinces.find((p) => p.code === Number(selectedProvince));
    const district = districts.find((d) => d.code === Number(selectedDistrict));
    const ward = wards.find((w) => w.code === Number(selectedWard));

    const fullAddress = [ward?.name, district?.name, province?.name].filter(Boolean).join(', ');

    console.log(fullAddress); // Để kiểm tra giá trị của fullAddress trong cons

    const finalFormData = {
      ...formData,
      address: fullAddress,
    };

    try {
      if (hasProfile) {
        await axios.put(`${url}/v1/profile/update`, finalFormData, {
          withCredentials: true,
        });
      } else {
        await axios.post(`${url}/v1/profile/create`, finalFormData, {
          withCredentials: true,
        });
      }

      setMessage('Thông tin đã được lưu!');
    } catch (err) {
      setMessage('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="profile">
      <div className="header">
        <Header />
      </div>
      <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-md mt-10">
        <h2 className="text-xl font-semibold mb-4 text-center">Thiết lập thông tin cá nhân</h2>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            name="fullName"
            type="text"
            placeholder="Họ và tên"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full border rounded"
            required
          />
          <input
            name="phone"
            type="tel"
            placeholder="Số điện thoại"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded"
            required
          />

          <input
            name="address"
            type="text"
            placeholder="Địa chỉ"
            value={formData.address}
            className="w-full border rounded"
            disabled
          />

          <select
            name="province"
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="w-full border rounded"
            required
          >
            <option value="">Chọn Tỉnh/Thành phố</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </select>
          <select
            name="district"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full border rounded"
            required
            disabled={!districts.length}
          >
            <option value="">Chọn Quận/Huyện</option>
            {districts.map((district) => (
              <option key={district.code} value={district.code}>
                {district.name}
              </option>
            ))}
          </select>
          <select
            name="ward"
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="w-full border rounded"
            required
            disabled={!wards.length}
          >
            <option value="">Chọn Phường/Xã</option>
            {wards.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </select>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border rounded"
          >
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
          <input
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleChange}
            className="w-full border rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {loading ? 'Đang lưu...' : hasProfile ? 'Cập nhật' : 'Lưu thông tin'}
          </button>
          {message && <p className="text-center text-sm mt-2">{message}</p>}
        </form>
      </div>
      <div className="footer">
        <Footer />
      </div>
    </div>
  );
};

export default SetupProfile;
