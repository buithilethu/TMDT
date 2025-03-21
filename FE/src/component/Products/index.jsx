import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../HomePage/Header';
import Footer from '../HomePage/Footer';
import '../Products/style.css';

const AddProduct = () => {
  // State cho form thêm sản phẩm
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImages, setProductImages] = useState([null]);
  const [productAttributes, setProductAttributes] = useState([{ name: '' }]);
  const [productVariants, setProductVariants] = useState([]);
  const [productError, setProductError] = useState([]);

  // State cho form thêm danh mục
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);

  // State cho form sửa sản phẩm
  const [editProductId, setEditProductId] = useState('');
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editImages, setEditImages] = useState([]);
  const [editAttributes, setEditAttributes] = useState([]);
  const [editVariants, setEditVariants] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [deletedVariants, setDeletedVariants] = useState([]);
  const [editError, setEditError] = useState([]);

  // State chung
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    if (productVariants.length === 0) addProductVariant();
  }, []);

  // Fetch dữ liệu từ API
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3000/v1/categories/');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Lỗi tải danh mục:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/v1/products/');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Lỗi tải sản phẩm:', err);
    }
  };

  // Hàm validate dữ liệu
  const validateJson = (data) => {
    const errors = [];
    if (!data.name) errors.push('Tên sản phẩm không được để trống');
    if (!data.description) errors.push('Mô tả sản phẩm không được để trống');
    if (!data.category_id && !data.category) errors.push('Vui lòng chọn danh mục');
    if (!data.price || isNaN(data.price) || data.price <= 0) errors.push('Giá sản phẩm phải là số dương');
    if (!data.variants || data.variants.length === 0) errors.push('Phải có ít nhất một biến thể');
    else {
      data.variants.forEach((variant, index) => {
        if (!variant.price || isNaN(variant.price) || variant.price <= 0) errors.push(`Biến thể ${index + 1}: Giá biến thể phải là số dương`);
        if (variant.stock === '' || isNaN(variant.stock) || variant.stock < 0) errors.push(`Biến thể ${index + 1}: Số lượng phải là số không âm`);
        if (!variant.attributes || Object.keys(variant.attributes).length === 0) errors.push(`Biến thể ${index + 1}: Phải có ít nhất một thuộc tính`);
        else Object.entries(variant.attributes).forEach(([key, value]) => {
          if (!value) errors.push(`Biến thể ${index + 1}: Giá trị thuộc tính '${key}' không được để trống`);
        });
      });
    }
    return errors;
  };

  // Xử lý form thêm sản phẩm
  const addProductImage = () => setProductImages([...productImages, null]);
  const handleProductImageChange = (index, e) => {
    const newImages = [...productImages];
    newImages[index] = e.target.files[0];
    setProductImages(newImages);
  };
  const removeProductImage = (index) => {
    const newImages = productImages.filter((_, i) => i !== index);
    setProductImages(newImages.length > 0 ? newImages : [null]);
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
    validImages.forEach((image, index) => {
      formData.append('images', image);
    });

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

  // Xử lý form thêm danh mục
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

  // Xử lý form sửa sản phẩm
  const loadProductData = async (productId) => {
    if (!productId) {
      resetEditForm();
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/v1/products/${productId}`);
      const product = await response.json();

      setEditProductId(product._id);
      setEditName(product.name || '');
      setEditDescription(product.description || '');
      setEditPrice(product.price || '');
      setEditCategory(product.category_id || (product.category && product.category[0]?._id) || '');
      setEditImages(product.images?.map(img => ({
        url: img.url || `http://localhost:3000/${img}`,
        _id: img._id
      })) || []);
      setEditAttributes(product.variants?.length > 0 
        ? [...new Set(product.variants.flatMap(v => Object.keys(v.attributes)))]
            .map(name => ({ name })) 
        : [{ name: '' }]
      );
      setEditVariants(product.variants?.map(v => ({
        _id: v._id,
        price: v.price || '',
        stock: v.stock || '',
        attributes: { ...v.attributes }
      })) || []);
      setDeletedImages([]);
      setDeletedVariants([]);
      
      if (!product.variants || product.variants.length === 0) {
        addEditVariant();
      }
      if (!product.images || product.images.length === 0) {
        addEditImage();
      }
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
    addEditVariant();
  };

  const addEditImage = () => setEditImages([...editImages, null]);
  const handleEditImageChange = (index, e) => {
    const newImages = [...editImages];
    newImages[index] = e.target.files[0];
    setEditImages(newImages);
  };
  const removeEditImage = (index) => {
    const image = editImages[index];
    if (image && image.url) setDeletedImages([...deletedImages, image.url]);
    const newImages = editImages.filter((_, i) => i !== index);
    setEditImages(newImages.length > 0 ? newImages : [null]);
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

  return (
    <div className="addproducts">
      <Header />
      <div className="container my-3">
        {/* Form Thêm Sản Phẩm */}
        <div className="px-3">
          <button className="btn btn-secondary w-100 mb-3" type="button" data-bs-toggle="collapse" data-bs-target="#product-form">
            Thêm sản phẩm (bấm để xổ xuống)
          </button>
          <div className="collapse" id="product-form">
            <form onSubmit={handleProductSubmit} encType="multipart/form-data" className="px-3 py-3 border my-3">
              <div className="form-floating my-3">
                <input type="text" className="form-control" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Tên sản phẩm" />
                <label>Tên sản phẩm</label>
              </div>
              <div className="form-floating my-3">
                <input type="text" className="form-control" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} placeholder="Mô tả sản phẩm" />
                <label>Mô tả sản phẩm</label>
              </div>
              <div className="input-group my-3">
                <span className="input-group-text">Danh mục</span>
                <select className="form-select" value={productCategory} onChange={(e) => setProductCategory(e.target.value)}>
                  <option value="">Chọn danh mục...</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-floating my-3">
                <input type="number" className="form-control" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="Giá thành sản phẩm" />
                <label>Giá thành sản phẩm</label>
              </div>

              <div className="px-3 py-3 border my-3">
                <button type="button" onClick={addProductImage} className="btn btn-primary mb-3">Thêm hình</button>
                <div>
                  {productImages.map((image, index) => (
                    <div key={index} className="input-group mb-3 px-3 py-3 border">
                      <input type="file" className="form-control" onChange={(e) => handleProductImageChange(index, e)} />
                      <button type="button" className="btn btn-danger" onClick={() => removeProductImage(index)}>Xóa</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-3 py-3 border my-3">
                <button type="button" onClick={addProductAttribute} className="btn btn-primary mb-3">Thêm thuộc tính</button>
                <div>
                  {productAttributes.map((attr, index) => (
                    <div key={index} className="input-group mb-3 px-3 py-3 border">
                      <input
                        type="text"
                        className="form-control"
                        value={attr.name}
                        onChange={(e) => handleProductAttributeChange(index, e.target.value)}
                        placeholder="Tên thuộc tính (VD: color, size)"
                      />
                      <button type="button" className="btn btn-danger" onClick={() => removeProductAttribute(index)}>Xóa</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-3 py-3 border my-3">
                <button type="button" onClick={addProductVariant} className="btn btn-primary mb-3">Thêm biến thể</button>
                <div>
                  {productVariants.map((variant, vIndex) => (
                    <div key={vIndex} className="mb-3 px-3 py-3 border">
                      <div className="mb-3">
                        <label className="form-label">Giá biến thể</label>
                        <input
                          type="number"
                          className="form-control"
                          value={variant.price}
                          onChange={(e) => handleProductVariantChange(vIndex, 'price', e.target.value)}
                          placeholder="Giá biến thể"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Số lượng</label>
                        <input
                          type="number"
                          className="form-control"
                          value={variant.stock}
                          onChange={(e) => handleProductVariantChange(vIndex, 'stock', e.target.value)}
                          placeholder="Số lượng"
                        />
                      </div>
                      {productAttributes.map((attr, aIndex) => attr.name && (
                        <div key={aIndex} className="mb-3">
                          <label className="form-label">{attr.name}</label>
                          <input
                            type="text"
                            className="form-control"
                            value={variant.attributes[attr.name] || ''}
                            onChange={(e) => handleProductVariantChange(vIndex, attr.name, e.target.value)}
                            placeholder="Giá trị thuộc tính (VD: Black, S)"
                          />
                        </div>
                      ))}
                      <button type="button" className="btn btn-danger" onClick={() => removeProductVariant(vIndex)}>Xóa</button>
                    </div>
                  ))}
                </div>
              </div>

              {productError.length > 0 && (
                <div className="error-message">
                  {productError.map((err, idx) => <div key={idx}>{err}</div>)}
                </div>
              )}
              <button type="submit" className="btn btn-primary mt-3">Thêm</button>
            </form>
          </div>
        </div>

        {/* Form Thêm Danh Mục */}
        <div className="mx-3 my-3">
          <button className="btn btn-secondary w-100 mb-3" type="button" data-bs-toggle="collapse" data-bs-target="#category-form">
            Thêm danh mục (bấm để xổ xuống)
          </button>
          <div className="collapse" id="category-form">
            <form onSubmit={handleCategorySubmit} encType="multipart/form-data" className="px-3 py-3 border my-3">
              <div className="form-floating my-3">
                <input type="text" className="form-control" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Tên danh mục" />
                <label>Tên danh mục</label>
              </div>
              <div className="input-group mb-3 px-3 py-3 border">
                <input type="file" className="form-control" onChange={(e) => setCategoryImage(e.target.files[0])} />
              </div>
              <button type="submit" className="btn btn-primary mt-3">Thêm</button>
            </form>
          </div>
        </div>

        {/* Form Sửa Sản Phẩm */}
        <div className="my-3">
          <button className="btn btn-secondary w-100 mb-3" type="button" data-bs-toggle="collapse" data-bs-target="#edit-product-form">
            Sửa sản phẩm (bấm để xổ xuống)
          </button>
          <div className="collapse" id="edit-product-form">
            <div className="px-3 py-3 border my-3">
              <div className="input-group">
                <span className="input-group-text">Chọn sản phẩm</span>
                <select className="form-select" value={editProductId} onChange={(e) => loadProductData(e.target.value)}>
                  <option value="">Chọn một sản phẩm...</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>{product.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <form onSubmit={handleEditSubmit} encType="multipart/form-data" className="px-3">
              <input type="hidden" value={editProductId} />
              <div className="px-3 py-3 border my-3">
                <div className="form-floating my-3">
                  <input type="text" className="form-control" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Tên sản phẩm" />
                  <label>Tên sản phẩm</label>
                </div>
                <div className="form-floating my-3">
                  <input type="text" className="form-control" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Mô tả sản phẩm" />
                  <label>Mô tả sản phẩm</label>
                </div>
                <div className="input-group my-3">
                  <span className="input-group-text">Danh mục</span>
                  <select className="form-select" value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                    <option value="">Chọn danh mục...</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-floating my-3">
                  <input type="number" className="form-control" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder="Giá thành sản phẩm" />
                  <label>Giá thành sản phẩm</label>
                </div>
              </div>

              <div className="px-3 py-3 border my-3">
                <button type="button" onClick={addEditImage} className="btn btn-primary mb-3">Thêm hình</button>
                <div>
                  {editImages.map((image, index) => (
                    <div key={index} className="input-group mb-3 px-3 py-3 border">
                      {image?.url ? (
                        <>
                          <img src={image.url} alt="Preview" style={{ maxWidth: '100px', marginRight: '10px' }} />
                          <button type="button" className="btn btn-danger" onClick={() => removeEditImage(index)}>Xóa</button>
                        </>
                      ) : (
                        <>
                          <input type="file" className="form-control" onChange={(e) => handleEditImageChange(index, e)} />
                          <button type="button" className="btn btn-danger" onClick={() => removeEditImage(index)}>Xóa</button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-3 py-3 border my-3">
                <button type="button" onClick={addEditAttribute} className="btn btn-primary mb-3">Thêm thuộc tính</button>
                <div>
                  {editAttributes.map((attr, index) => (
                    <div key={index} className="input-group mb-3 px-3 py-3 border">
                      <input
                        type="text"
                        className="form-control"
                        value={attr.name}
                        onChange={(e) => handleEditAttributeChange(index, e.target.value)}
                        placeholder="Tên thuộc tính (VD: color, size)"
                      />
                      <button type="button" className="btn btn-danger" onClick={() => removeEditAttribute(index)}>Xóa</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-3 py-3 border my-3">
                <button type="button" onClick={addEditVariant} className="btn btn-primary mb-3">Thêm biến thể</button>
                <div>
                  {editVariants.map((variant, vIndex) => (
                    <div key={vIndex} className="mb-3 px-3 py-3 border">
                      <div className="mb-3">
                        <label className="form-label">Giá biến thể</label>
                        <input
                          type="number"
                          className="form-control"
                          value={variant.price}
                          onChange={(e) => handleEditVariantChange(vIndex, 'price', e.target.value)}
                          placeholder="Giá biến thể"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Số lượng</label>
                        <input
                          type="number"
                          className="form-control"
                          value={variant.stock}
                          onChange={(e) => handleEditVariantChange(vIndex, 'stock', e.target.value)}
                          placeholder="Số lượng"
                        />
                      </div>
                      {editAttributes.map((attr, aIndex) => attr.name && (
                        <div key={aIndex} className="mb-3">
                          <label className="form-label">{attr.name}</label>
                          <input
                            type="text"
                            className="form-control"
                            value={variant.attributes[attr.name] || ''}
                            onChange={(e) => handleEditVariantChange(vIndex, attr.name, e.target.value)}
                            placeholder="Giá trị thuộc tính (VD: Black, S)"
                          />
                        </div>
                      ))}
                      <button type="button" className="btn btn-danger" onClick={() => removeEditVariant(vIndex)}>Xóa</button>
                    </div>
                  ))}
                </div>
              </div>

              {editError.length > 0 && (
                <div className="error-message">
                  {editError.map((err, idx) => <div key={idx}>{err}</div>)}
                </div>
              )}
              <button type="submit" className="btn btn-primary mt-3">Cập nhật</button>
              <button type="button" className="btn btn-danger mt-3 ms-2" onClick={handleRemoveProduct}>Xóa sản phẩm</button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AddProduct;