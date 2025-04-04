import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';

import Header from '../HomePage/Header';
import Footer from '../HomePage/Footer';
import '../Products/style.css';
import { url } from '../data.js'
const AddProduct = () => {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImages, setProductImages] = useState([null]);
  const [productImagePreviews, setProductImagePreviews] = useState([]);
  const [productAttributes, setProductAttributes] = useState([{ name: '' }]);
  const [productVariants, setProductVariants] = useState([]);
  const [productError, setProductError] = useState([]);

  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;
  const [editProductId, setEditProductId] = useState('');
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editImages, setEditImages] = useState([]);
  const [editImagePreviews, setEditImagePreviews] = useState([]);
  const [editAttributes, setEditAttributes] = useState([]);
  const [editVariants, setEditVariants] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [deletedVariants, setDeletedVariants] = useState([]);
  const [editError, setEditError] = useState([]);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    if (productVariants.length === 0) addProductVariant();
  }, []);

  useEffect(() => {
    return () => {
      productImagePreviews.forEach(preview => {
        if (preview) URL.revokeObjectURL(preview);
      });
      editImagePreviews.forEach(preview => {
        if (preview) URL.revokeObjectURL(preview);
      });
      if (categoryImagePreview) URL.revokeObjectURL(categoryImagePreview);
    };
  }, [productImagePreviews, editImagePreviews, categoryImagePreview]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${url}/v1/categories/`);
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Lỗi tải danh mục:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${url}/v1/products/`)
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Lỗi tải sản phẩm:', err);
    }
  };

  const validateJson = (data) => {
    const errors = [];
    if (!data.name) errors.push('Tên sản phẩm không được để trống');
    if (!data.description) errors.push('Mô tả sản phẩm không được để trống');
    if (!data.category_id && !data.category) errors.push('Vui lòng chọn danh mục');
    if (!data.price || isNaN(data.price) || data.price <= 0) errors.push('Giá sản phẩm phải là số dương');
    if (!data.variants || data.variants.length === 0) errors.push('Phải có ít nhất một biến thể');
    else {
      data.variants.forEach((variant, index) => {
        if (!variant.price || isNaN(variant.price) || variant.price <= 0)
          errors.push(`Biến thể ${index + 1}: Giá biến thể phải là số dương`);
        if (variant.stock === '' || isNaN(variant.stock) || variant.stock < 0)
          errors.push(`Biến thể ${index + 1}: Số lượng phải là số không âm`);
        if (!variant.attributes || Object.keys(variant.attributes).length === 0)
          errors.push(`Biến thể ${index + 1}: Phải có ít nhất một thuộc tính`);
        else Object.entries(variant.attributes).forEach(([key, value]) => {
          if (!value) errors.push(`Biến thể ${index + 1}: Giá trị thuộc tính '${key}' không được để trống`);
        });
      });
    }
    return errors;
  };

  const addProductImage = () => {
    setProductImages([...productImages, null]);
    setProductImagePreviews([...productImagePreviews, null]);
  };

  const handleProductImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...productImages];
      newImages[index] = file;
      setProductImages(newImages);

      const newPreviews = [...productImagePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setProductImagePreviews(newPreviews);
    }
  };

  const removeProductImage = (index) => {
    const newImages = [...productImages];
    const newPreviews = [...productImagePreviews];
    const removedImage = newImages.splice(index, 1)[0];
    const removedPreview = newPreviews.splice(index, 1)[0];
    if (removedPreview) URL.revokeObjectURL(removedPreview);
    if (newImages.length === 0) {
      newImages.push(null);
      newPreviews.push(null);
    }
    setProductImages(newImages);
    setProductImagePreviews(newPreviews);
  };

  const addProductAttribute = () => setProductAttributes([...productAttributes, { name: '' }]);

  const handleProductAttributeChange = (index, value) => {
    const newAttributes = [...productAttributes];
    newAttributes[index].name = value;
    setProductAttributes(newAttributes);
    updateProductVariantAttributes();
  };

  const removeProductAttribute = (index) => {
    if (productAttributes.length > 1) {
      setProductAttributes(productAttributes.filter((_, i) => i !== index));
      updateProductVariantAttributes();
    }
  };

  const addProductVariant = () => {
    const newVariant = { price: '', stock: '', attributes: {} };
    productAttributes.forEach(attr => { if (attr.name) newVariant.attributes[attr.name] = ''; });
    setProductVariants([...productVariants, newVariant]);
  };

  const handleProductVariantChange = (index, field, value) => {
    const newVariants = [...productVariants];
    if (field === 'price' || field === 'stock') newVariants[index][field] = value;
    else newVariants[index].attributes[field] = value;
    setProductVariants(newVariants);
  };

  const removeProductVariant = (index) => {
    const newVariants = productVariants.filter((_, i) => i !== index);
    setProductVariants(newVariants.length > 0 ? newVariants : []);
    if (newVariants.length === 0) addProductVariant();
  };

  const updateProductVariantAttributes = () => {
    const newVariants = productVariants.map(variant => {
      const updatedAttributes = {};
      productAttributes.forEach(attr => {
        if (attr.name) updatedAttributes[attr.name] = variant.attributes[attr.name] || '';
      });
      return { ...variant, attributes: updatedAttributes };
    });
    setProductVariants(newVariants);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: productName.trim(),
      description: productDescription.trim(),
      category_id: productCategory,
      price: productPrice ? parseInt(productPrice) : null,
      variants: productVariants.map(variant => ({
        price: parseInt(variant.price) || 0,
        stock: parseInt(variant.stock) || 0,
        attributes: variant.attributes,
      })),
    };
    const validImages = productImages.filter(image => image !== null);
    if (validImages.length === 0) {
      setProductError(['Vui lòng thêm ít nhất một hình ảnh sản phẩm']);
      return;
    }
    const errors = validateJson(data);
    if (errors.length > 0) {
      setProductError(errors);
      return;
    }
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    validImages.forEach(image => formData.append('images', image));
    try {
      const response = await fetch('http://localhost:3000/v1/products/', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi không xác định từ server');
      }
      await response.json();
      alert('Sản phẩm đã được thêm thành công!');
      setProductName('');
      setProductDescription('');
      setProductCategory('');
      setProductPrice('');
      setProductImages([null]);
      setProductAttributes([{ name: '' }]);
      setProductVariants([]);
      setProductError([]);
      addProductVariant();
      fetchProducts();
    } catch (err) {
      console.error('Lỗi:', err);
      setProductError([err.message || 'Có lỗi khi thêm sản phẩm!']);
    }
  };

  const handleCategoryImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategoryImage(file);
      const previewUrl = URL.createObjectURL(file);
      setCategoryImagePreview(previewUrl);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', categoryName);
    if (categoryImage) formData.append('images', categoryImage);
    try {
      const response = await fetch('http://localhost:3000/v1/categories/', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (response.status === 201) {
        alert('Tạo danh mục thành công!');
        setCategoryName('');
        setCategoryImage(null);
        setCategoryImagePreview(null);
        fetchCategories();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi thêm danh mục');
      }
    } catch (err) {
      console.error('Lỗi:', err);
      alert(err.message || 'Có lỗi khi thêm danh mục!');
    }
  };

  const loadProductData = async (productId) => {
    if (!productId) {
      resetEditForm();
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/v1/products/${productId}`);
      const product = await response.json();
      setSelectedProduct(product);
      setEditProductId(product._id);
      setEditName(product.name || '');
      setEditDescription(product.description || '');
      setEditPrice(product.price || '');
      setEditCategory(product.category_id || (product.category && product.category[0]?._id) || '');
      const formattedImages = product.images?.map(img => ({
        url: img.url || `http://localhost:3000/${img}`,
        _id: img._id
      })) || [];
      setEditImages(formattedImages);
      setEditImagePreviews(formattedImages.map(img => img.url));
      const attributes = product.variants?.length > 0
        ? [...new Set(product.variants.flatMap(v => Object.keys(v.attributes)))].map(name => ({ name }))
        : [{ name: '' }];
      setEditAttributes(attributes);
      const variants = product.variants?.map(v => ({
        _id: v._id,
        price: v.price || '',
        stock: v.stock || '',
        attributes: { ...v.attributes }
      })) || [];
      setEditVariants(variants);
      setDeletedImages([]);
      setDeletedVariants([]);
    } catch (err) {
      console.error('Lỗi tải dữ liệu sản phẩm:', err);
      alert('Có lỗi khi tải dữ liệu sản phẩm!');
    }
  };

  const resetEditForm = () => {
    setEditProductId('');
    setEditName('');
    setEditDescription('');
    setEditCategory('');
    setEditPrice('');
    setEditImages([null]);
    setEditAttributes([{ name: '' }]);
    setEditVariants([]);
    setDeletedImages([]);
    setDeletedVariants([]);
    setEditError([]);
    setSelectedProduct(null);
    setEditImagePreviews([]);
  };

  const addEditImage = () => {
    setEditImages([...editImages, null]);
    setEditImagePreviews([...editImagePreviews, null]);
  };

  const handleEditImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...editImages];
      newImages[index] = file;
      setEditImages(newImages);
      const newPreviews = [...editImagePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setEditImagePreviews(newPreviews);
    }
  };

  const removeEditImage = (index) => {
    const image = editImages[index];
    if (image?.url) setDeletedImages([...deletedImages, image.url]);
    const newImages = editImages.filter((_, i) => i !== index);
    const newPreviews = editImagePreviews.filter((_, i) => i !== index);
    if (editImagePreviews[index]) URL.revokeObjectURL(editImagePreviews[index]);
    setEditImages(newImages.length > 0 ? newImages : [null]);
    setEditImagePreviews(newPreviews.length > 0 ? newPreviews : [null]);
  };

  const addEditAttribute = () => setEditAttributes([...editAttributes, { name: '' }]);

  const handleEditAttributeChange = (index, value) => {
    const newAttributes = [...editAttributes];
    newAttributes[index].name = value;
    setEditAttributes(newAttributes);
    updateEditVariantAttributes();
  };

  const removeEditAttribute = (index) => {
    if (editAttributes.length > 1) {
      setEditAttributes(editAttributes.filter((_, i) => i !== index));
      updateEditVariantAttributes();
    }
  };

  const addEditVariant = () => {
    const newVariant = { price: '', stock: '', attributes: {} };
    editAttributes.forEach(attr => { if (attr.name) newVariant.attributes[attr.name] = ''; });
    setEditVariants([...editVariants, newVariant]);
  };

  const handleEditVariantChange = (index, field, value) => {
    const newVariants = [...editVariants];
    if (field === 'price' || field === 'stock') newVariants[index][field] = value;
    else newVariants[index].attributes[field] = value;
    setEditVariants(newVariants);
  };

  const removeEditVariant = (index) => {
    const variant = editVariants[index];
    if (variant._id) setDeletedVariants([...deletedVariants, variant._id]);
    const newVariants = editVariants.filter((_, i) => i !== index);
    setEditVariants(newVariants.length > 0 ? newVariants : []);
    if (newVariants.length === 0) addEditVariant();
  };

  const updateEditVariantAttributes = () => {
    const newVariants = editVariants.map(variant => {
      const updatedAttributes = {};
      editAttributes.forEach(attr => {
        if (attr.name) updatedAttributes[attr.name] = variant.attributes[attr.name] || '';
      });
      return { ...variant, attributes: updatedAttributes };
    });
    setEditVariants(newVariants);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editProductId) {
      alert('Vui lòng chọn sản phẩm để cập nhật!');
      return;
    }
    const data = {
      name: editName.trim(),
      description: editDescription.trim(),
      category_id: editCategory,
      price: editPrice ? parseInt(editPrice) : null,
      variants: editVariants.map(v => ({
        _id: v._id,
        price: parseInt(v.price) || 0,
        stock: parseInt(v.stock) || 0,
        attributes: v.attributes
      })),
      delete: { images: deletedImages, variants: deletedVariants },
    };
    const errors = validateJson(data);
    if (errors.length > 0) {
      setEditError(errors);
      return;
    }
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    editImages.forEach(image => {
      if (image && !image.url) formData.append('images', image);
    });
    try {
      const response = await fetch(`http://localhost:3000/v1/products/${editProductId}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi cập nhật sản phẩm');
      }
      await response.json();
      alert('Sản phẩm đã được cập nhật thành công!');
      resetEditForm();
      fetchProducts();
    } catch (err) {
      console.error('Lỗi:', err);
      setEditError([err.message || 'Có lỗi khi cập nhật sản phẩm!']);
    }
  };

  const handleRemoveProduct = async () => {
    if (!editProductId) {
      alert('Vui lòng chọn sản phẩm để xóa!');
      return;
    }
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      const response = await fetch(`http://localhost:3000/v1/products/${editProductId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi xóa sản phẩm');
      }
      alert('Sản phẩm đã được xóa thành công!');
      resetEditForm();
      fetchProducts();
    } catch (err) {
      console.error('Lỗi:', err);
      alert(err.message || 'Có lỗi khi xóa sản phẩm!');
    }
  };

  // Lọc và phân trang sản phẩm
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="addproducts">
      <Header />
      <div className="container my-3">
        <div>
          <button className="btn btn-secondary w-100 mb-3" type="button" data-bs-toggle="collapse" data-bs-target="#product-form">
            Thêm sản phẩm
          </button>
          <div className="collapse" id="product-form">
            <form onSubmit={handleProductSubmit} className="border rounded p-4 bg-white shadow-sm">
              <div className="row mb-4 w-100">
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Tên sản phẩm"
                      style={{ height: '60px' }}
                    />
                    <label style={{ top: '-5px', fontSize: '14px' }}>Tên sản phẩm</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating mb-3">
                    <input
                      type="number"
                      className="form-control"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      placeholder="Giá sản phẩm"
                      style={{ height: '60px' }}
                    />
                    <label style={{ top: '-5px', fontSize: '14px' }}>Giá sản phẩm</label>
                  </div>
                </div>
              </div>
              <div className="row mb-4 w-100">
                <div className="col-md-8">
                  <div className="form-floating mb-3">
                    <textarea
                      className="form-control"
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      placeholder="Mô tả sản phẩm"
                      style={{ height: '220px' }}
                    />
                    <label style={{ top: '-5px', fontSize: '14px' }}>Mô tả sản phẩm</label>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-floating mb-3">
                    <select
                      className="form-select"
                      value={productCategory}
                      onChange={(e) => setProductCategory(e.target.value)}
                      style={{ height: '60px' }}
                    >
                      <option value="">Chọn danh mục...</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                    <label style={{ top: '-5px', fontSize: '14px' }}>Danh mục</label>
                  </div>
                </div>
              </div>
              <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center w-100">
                  <h5 className="mb-0">Hình ảnh sản phẩm</h5>
                  <button type="button" onClick={addProductImage} className="btn btn-primary btn-sm">
                    <i className="fas fa-plus"></i> Thêm hình
                  </button>
                </div>
                <div className="card-body">
                  <div className="row">
                    {productImages.map((image, index) => (
                      <div key={index} className="col-md-4 mb-3">
                        <div className="card h-100">
                          <div className="card-body">
                            <div className="image-preview mb-3" style={{ height: '200px', background: '#f8f9fa' }}>
                              {productImagePreviews[index] ? (
                                <img
                                  src={productImagePreviews[index]}
                                  alt="Preview"
                                  className="img-fluid h-100 w-100"
                                  style={{ objectFit: 'contain' }}
                                />
                              ) : (
                                <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                                  <FontAwesomeIcon icon={faImage} size="2x" className="text-muted" />
                                </div>
                              )}
                            </div>
                            <div className="input-group">
                              <input
                                type="file"
                                className="form-control"
                                onChange={(e) => handleProductImageChange(index, e)}
                                accept="image/*"
                              />
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => removeProductImage(index)}
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Thuộc tính sản phẩm</h5>
                  <button type="button" onClick={addProductAttribute} className="btn btn-primary btn-sm">
                    <i className="fas fa-plus"></i> Thêm thuộc tính
                  </button>
                </div>
                <div className="card-body">
                  {productAttributes.map((attr, index) => (
                    <div key={index} className="input-group mb-3">
                      <input
                        type="text"
                        className="form-control"
                        value={attr.name}
                        onChange={(e) => handleProductAttributeChange(index, e.target.value)}
                        placeholder="Tên thuộc tính (VD: color, size)"
                        style={{ height: '50px' }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => removeProductAttribute(index)}
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Biến thể sản phẩm</h5>
                  <button type="button" onClick={addProductVariant} className="btn btn-primary btn-sm">
                    <i className="fas fa-plus"></i> Thêm biến thể
                  </button>
                </div>
                <div className="card-body">
                  {productVariants.map((variant, vIndex) => (
                    <div key={vIndex} className="card mb-3">
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <div className="form-floating mb-3">
                              <input
                                type="number"
                                className="form-control"
                                value={variant.price}
                                onChange={(e) => handleProductVariantChange(vIndex, 'price', e.target.value)}
                                placeholder="Giá biến thể"
                                style={{ height: '60px' }}
                              />
                              <label style={{ top: '-5px', fontSize: '14px' }}>Giá biến thể</label>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-floating mb-3">
                              <input
                                type="number"
                                className="form-control"
                                value={variant.stock}
                                onChange={(e) => handleProductVariantChange(vIndex, 'stock', e.target.value)}
                                placeholder="Số lượng"
                                style={{ height: '60px' }}
                              />
                              <label style={{ top: '-5px', fontSize: '14px' }}>Số lượng</label>
                            </div>
                          </div>
                        </div>
                        {productAttributes.map((attr, aIndex) => attr.name && (
                          <div key={aIndex} className="form-floating mb-3">
                            <input
                              type="text"
                              className="form-control"
                              value={variant.attributes[attr.name] || ''}
                              onChange={(e) => handleProductVariantChange(vIndex, attr.name, e.target.value)}
                              placeholder={`Giá trị ${attr.name}`}
                              style={{ height: '60px' }}
                            />
                            <label style={{ top: '-5px', fontSize: '14px' }}>{attr.name}</label>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => removeProductVariant(vIndex)}
                        >
                          Xóa biến thể
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {productError.length > 0 && (
                <div className="alert alert-danger">
                  <ul className="mb-0">
                    {productError.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-save"></i> Lưu sản phẩm
              </button>
            </form>
          </div>
        </div>

        <div className="my-4">
          <button className="btn btn-secondary w-100 mb-3" type="button" data-bs-toggle="collapse" data-bs-target="#category-form">
            Thêm danh mục
          </button>
          <div className="collapse" id="category-form">
            <form onSubmit={handleCategorySubmit} className="border rounded p-4 bg-white shadow-sm">
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Tên danh mục"
                  style={{ height: '60px' }}
                />
                <label style={{ top: '-5px', fontSize: '14px' }}>Tên danh mục</label>
              </div>
              <div className="mb-3">
                <div className="image-preview mb-3" style={{ height: '200px', background: '#f8f9fa' }}>
                  {categoryImagePreview ? (
                    <img
                      src={categoryImagePreview}
                      alt="Preview"
                      className="img-fluid h-100 w-100"
                      style={{ objectFit: 'contain' }}
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                      <FontAwesomeIcon icon={faImage} size="2x" className="text-muted" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  className="form-control"
                  onChange={handleCategoryImageChange}
                  accept="image/*"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-save"></i> Lưu danh mục
              </button>
            </form>
          </div>
        </div>

        <div className="my-4">
          <button className="btn btn-secondary w-100 mb-3" type="button" data-bs-toggle="collapse" data-bs-target="#edit-product-form">
            Sửa sản phẩm
          </button>
          <div className="collapse" id="edit-product-form">
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ height: '60px' }}
              />
            </div>
            <div className="row">
              {currentProducts.length > 0 ? (
                currentProducts.map(product => (
                  <div key={product._id} className="col-md-2 mb-3">
                    <div
                      className={`card h-100 ${selectedProduct?._id === product._id ? 'border-primary' : ''}`}
                      onClick={() => loadProductData(product._id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img
                        src={product.images?.url || '/placeholder.jpg'}
                        className="card-img-top"
                        alt={product.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{product.name}</h5>
                        <p className="card-text text-truncate">{product.description}</p>
                        <p className="card-text">
                          <small className="text-muted">
                            Giá: {product.price?.toLocaleString('vi-VN')}đ
                          </small>
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center">
                  <p>Không tìm thấy sản phẩm nào.</p>
                </div>
              )}
            </div>
            {totalPages > 1 && (
              <nav>
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                      Trước
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => paginate(i + 1)}>
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                      Sau
                    </button>
                  </li>
                </ul>
              </nav>
            )}
            {selectedProduct && (
              <form onSubmit={handleEditSubmit} className="border rounded p-4 bg-white shadow-sm mt-4">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Tên sản phẩm"
                        style={{ height: '60px' }}
                      />
                      <label style={{ top: '-5px', fontSize: '14px' }}>Tên sản phẩm</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="number"
                        className="form-control"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        placeholder="Giá sản phẩm"
                        style={{ height: '60px' }}
                      />
                      <label style={{ top: '-5px', fontSize: '14px' }}>Giá sản phẩm</label>
                    </div>
                  </div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-8">
                    <div className="form-floating mb-3">
                      <textarea
                        className="form-control"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Mô tả sản phẩm"
                        style={{ height: '220px' }}
                      />
                      <label style={{ top: '-5px', fontSize: '14px' }}>Mô tả sản phẩm</label>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-floating mb-3">
                      <select
                        className="form-select"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        style={{ height: '60px' }}
                      >
                        <option value="">Chọn danh mục...</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                      <label style={{ top: '-5px', fontSize: '14px' }}>Danh mục</label>
                    </div>
                  </div>
                </div>
                <div className="card mb-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Hình ảnh sản phẩm</h5>
                    <button type="button" onClick={addEditImage} className="btn btn-primary btn-sm">
                      <i className="fas fa-plus"></i> Thêm hình
                    </button>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {editImages.map((image, index) => (
                        <div key={index} className="col-md-4 mb-3">
                          <div className="card h-100">
                            <div className="card-body">
                              <div className="image-preview mb-3" style={{ height: '200px', background: '#f8f9fa' }}>
                                {image?.url ? (
                                  <img
                                    src={image.url}
                                    alt="Preview"
                                    className="img-fluid h-100 w-100"
                                    style={{ objectFit: 'contain' }}
                                  />
                                ) : editImagePreviews[index] ? (
                                  <img
                                    src={editImagePreviews[index]}
                                    alt="Preview"
                                    className="img-fluid h-100 w-100"
                                    style={{ objectFit: 'contain' }}
                                  />
                                ) : (
                                  <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                                    <FontAwesomeIcon icon={faImage} size="2x" className="text-muted" />
                                  </div>
                                )}
                              </div>
                              <div className="input-group">
                                {!image?.url && (
                                  <input
                                    type="file"
                                    className="form-control"
                                    onChange={(e) => handleEditImageChange(index, e)}
                                    accept="image/*"
                                  />
                                )}
                                <button
                                  type="button"
                                  className="btn btn-outline-danger"
                                  onClick={() => removeEditImage(index)}
                                >
                                  Xóa
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="card mb-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Thuộc tính sản phẩm</h5>
                    <button type="button" onClick={addEditAttribute} className="btn btn-primary btn-sm">
                      <i className="fas fa-plus"></i> Thêm thuộc tính
                    </button>
                  </div>
                  <div className="card-body">
                    {editAttributes.map((attr, index) => (
                      <div key={index} className="input-group mb-3">
                        <input
                          type="text"
                          className="form-control"
                          value={attr.name}
                          onChange={(e) => handleEditAttributeChange(index, e.target.value)}
                          placeholder="Tên thuộc tính (VD: color, size)"
                          style={{ height: '50px' }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => removeEditAttribute(index)}
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card mb-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Biến thể sản phẩm</h5>
                    <button type="button" onClick={addEditVariant} className="btn btn-primary btn-sm">
                      <i className="fas fa-plus"></i> Thêm biến thể
                    </button>
                  </div>
                  <div className="card-body">
                    {editVariants.map((variant, vIndex) => (
                      <div key={vIndex} className="card mb-3">
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-floating mb-3">
                                <input
                                  type="number"
                                  className="form-control"
                                  value={variant.price}
                                  onChange={(e) => handleEditVariantChange(vIndex, 'price', e.target.value)}
                                  placeholder="Giá biến thể"
                                  style={{ height: '60px' }}
                                />
                                <label style={{ top: '-5px', fontSize: '14px' }}>Giá biến thể</label>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-floating mb-3">
                                <input
                                  type="number"
                                  className="form-control"
                                  value={variant.stock}
                                  onChange={(e) => handleEditVariantChange(vIndex, 'stock', e.target.value)}
                                  placeholder="Số lượng"
                                  style={{ height: '60px' }}
                                />
                                <label style={{ top: '-5px', fontSize: '14px' }}>Số lượng</label>
                              </div>
                            </div>
                          </div>
                          {editAttributes.map((attr, aIndex) => attr.name && (
                            <div key={aIndex} className="form-floating mb-3">
                              <input
                                type="text"
                                className="form-control"
                                value={variant.attributes[attr.name] || ''}
                                onChange={(e) => handleEditVariantChange(vIndex, attr.name, e.target.value)}
                                placeholder={`Giá trị ${attr.name}`}
                                style={{ height: '60px' }}
                              />
                              <label style={{ top: '-5px', fontSize: '14px' }}>{attr.name}</label>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => removeEditVariant(vIndex)}
                          >
                            Xóa biến thể
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {editError.length > 0 && (
                  <div className="alert alert-danger">
                    <ul className="mb-0">
                      {editError.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-4">
                  <button type="submit" className="btn btn-primary me-2">
                    <i className="fas fa-save"></i> Lưu thay đổi
                  </button>
                  <button type="button" className="btn btn-danger" onClick={handleRemoveProduct}>
                    Xóa sản phẩm
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AddProduct;