import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';



import Header from '../HomePage/Header';
import Footer from '../HomePage/Footer';
import '../Products/style.css';
import { url } from '../data.js';

const AddProduct = () => {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImages, setProductImages] = useState([null]);
  const [productImagePreviews, setProductImagePreviews] = useState([]);
  const [productError, setProductError] = useState([]);

  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState(null);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // State mới cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Tính toán phân trang và tìm kiếm
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchKeyword));
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    return () => {
      productImagePreviews.forEach(preview => preview && URL.revokeObjectURL(preview));
      if (categoryImagePreview) URL.revokeObjectURL(categoryImagePreview);
    };
  }, [productImagePreviews, categoryImagePreview]);

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
      const response = await fetch(`${url}/v1/products/`);
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Lỗi tải sản phẩm:', err);
    }
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

  const addProductImage = () => {
    setProductImages([...productImages, null]);
    setProductImagePreviews([...productImagePreviews, null]);
  };

  const removeProductImage = (index) => {
    const newImages = [...productImages];
    const newPreviews = [...productImagePreviews];
    const removedPreview = newPreviews.splice(index, 1)[0];
    newImages.splice(index, 1);
    if (removedPreview) URL.revokeObjectURL(removedPreview);
    setProductImages(newImages.length > 0 ? newImages : [null]);
    setProductImagePreviews(newPreviews.length > 0 ? newPreviews : []);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const validImages = productImages.filter(img => img instanceof File);

    if (validImages.length === 0) {
      setProductError(['Vui lòng thêm ít nhất một hình ảnh sản phẩm']);
      return;
    }

    const variants = productVariants.map(variant => ({
      price: parseFloat(variant.price),
      stock: parseInt(variant.stock),
      attributes: variant.attributes
    }));

    const data = {
      name: productName.trim(),
      description: productDescription.trim(),
      category_id: productCategory,
      price: parseFloat(productPrice),
      variants
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    validImages.forEach(image => formData.append('images', image));

    try {
      const response = await fetch(`${url}/v1/products/`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi không xác định từ server');
      }

      await response.json();
      alert('Sản phẩm đã được thêm thành công!');

      productImagePreviews.forEach(preview => preview && URL.revokeObjectURL(preview));
      setProductName('');
      setProductDescription('');
      setProductCategory('');
      setProductPrice('');
      setProductImages([null]);
      setProductImagePreviews([]);
      setProductError([]);
      setProductAttributes([{ name: '' }]);
      setProductVariants([]);
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
      setCategoryImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', categoryName);
    if (categoryImage) formData.append('images', categoryImage);

    try {
      const response = await fetch(`${url}/v1/categories/`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
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

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xoá danh mục này?')) return;
    try {
      const res = await fetch(`${url}/v1/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Xoá không thành công');
      alert('Danh mục đã được xoá thành công!');
      fetchCategories();
    } catch (err) {
      console.error('Lỗi xoá danh mục:', err);
      alert(err.message || 'Có lỗi khi xoá danh mục');
    }
  };

  const handleRemoveProduct = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá sản phẩm này?')) return;
    try {
      const res = await fetch(`${url}/v1/products/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Xoá sản phẩm không thành công');
      alert('Sản phẩm đã được xoá thành công!');
      fetchProducts();
    } catch (err) {
      console.error('Lỗi xoá sản phẩm:', err);
      alert(err.message || 'Có lỗi khi xoá sản phẩm');
    }
  };

  //variant
  const [productAttributes, setProductAttributes] = useState([{ name: '' }]);
  const [productVariants, setProductVariants] = useState([]);

  const addProductAttribute = () => {
    setProductAttributes(prev => [...prev, { name: '' }]);
  };

  const handleProductAttributeChange = (index, value) => {
    const updated = [...productAttributes];
    updated[index].name = value;
    setProductAttributes(updated);
    updateProductVariantAttributes(updated);
  };

  const removeProductAttribute = (index) => {
    const updated = productAttributes.filter((_, i) => i !== index);
    setProductAttributes(updated);
    updateProductVariantAttributes(updated);
  };

  const addProductVariant = () => {
    const newVariant = { price: '', stock: '', attributes: {} };
    productAttributes.forEach(attr => {
      if (attr.name) newVariant.attributes[attr.name] = '';
    });
    setProductVariants(prev => [...prev, newVariant]);
  };

  const handleProductVariantChange = (index, field, value) => {
    const updated = [...productVariants];
    if (field === 'price' || field === 'stock') {
      updated[index][field] = value;
    } else {
      updated[index].attributes[field] = value;
    }
    setProductVariants(updated);
  };

  const removeProductVariant = (index) => {
    const updated = productVariants.filter((_, i) => i !== index);
    setProductVariants(updated);
  };

  const updateProductVariantAttributes = (newAttributes) => {
    const updated = productVariants.map(variant => {
      const newAttrs = {};
      (newAttributes || productAttributes).forEach(attr => {
        newAttrs[attr.name] = variant.attributes?.[attr.name] || '';
      });
      return { ...variant, attributes: newAttrs };
    });
    setProductVariants(updated);
  };

  // Sinh tổ hợp biến thể từ tất cả giá trị các thuộc tính
  const generateVariantCombinations = () => {
    const attrValues = {};
    productAttributes.forEach(attr => {
      if (attr.name) {
        const input = prompt(`Nhập giá trị cho thuộc tính "${attr.name}" (cách nhau bằng dấu phẩy):`);
        if (input) {
          attrValues[attr.name] = input.split(',').map(v => v.trim()).filter(Boolean);
        }
      }
    });

    const generateCombinations = (attrs, index = 0, current = {}) => {
      if (index === attrs.length) return [current];
      const key = attrs[index];
      const values = attrValues[key] || [];
      let results = [];
      values.forEach(val => {
        results = results.concat(
          generateCombinations(attrs, index + 1, { ...current, [key]: val })
        );
      });
      return results;
    };

    const combinations = generateCombinations(Object.keys(attrValues));
    const variants = combinations.map(c => ({ attributes: c, price: '', stock: '' }));
    setProductVariants(variants);
  };

  //sidebar


  return (
    <div className="addproducts">
      <Header />
      <div className="container my-3">
        <h3>Thêm Sản Phẩm</h3>
        <form onSubmit={handleProductSubmit} className="border rounded p-4 bg-white shadow-sm">
          <div className="mb-3">
            <label>Tên sản phẩm</label>
            <input
              type="text"
              className="form-control"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label>Mô tả sản phẩm</label>
            <textarea
              className="form-control"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label>Giá</label>
            <input
              type="number"
              className="form-control"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label>Danh mục</label>
            <select
              className="form-select"
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              required
            >
              <option value="">Chọn danh mục</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label>Hình ảnh sản phẩm</label>
            {productImages.map((image, index) => (
              <div key={index} className="input-group mb-2">
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => handleProductImageChange(index, e)}
                />
                {productImagePreviews[index] && (
                  <img
                    src={productImagePreviews[index]}
                    alt="Preview"
                    className="img-thumbnail ms-2"
                    style={{ maxWidth: '150px' }}
                  />
                )}
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => removeProductImage(index)}
                >
                  Xoá
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-outline-primary" onClick={addProductImage}>
              Thêm hình ảnh
            </button>
          </div>
          {productError.length > 0 && (
            <div className="alert alert-danger">
              <ul>{productError.map((err, idx) => <li key={idx}>{err}</li>)}</ul>
            </div>
          )}

          <h3>Thuộc tính sản phẩm (ví dụ: Màu sắc)</h3>
          {productAttributes.map((attr, index) => (
            <div key={index} className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Tên thuộc tính (ví dụ: Color)"
                value={attr.name}
                onChange={(e) => handleProductAttributeChange(index, e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => removeProductAttribute(index)}
              >
                Xoá
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-outline-primary mb-3 me-2" onClick={addProductAttribute}>
            Thêm thuộc tính
          </button>
          <button type="button" className="btn btn-outline-warning mb-3" onClick={generateVariantCombinations}>
            Tự động tạo biến thể từ thuộc tính
          </button>

          <h3>Biến thể sản phẩm</h3>
          {productVariants.map((variant, index) => (
            <div key={index} className="border p-3 rounded mb-3">
              <div className="mb-2">
                {productAttributes.map((attr, i) => (
                  <input
                    key={i}
                    type="text"
                    className="form-control mb-2"
                    placeholder={`Giá trị cho ${attr.name}`}
                    value={variant.attributes?.[attr.name] || ''}
                    onChange={(e) => handleProductVariantChange(index, attr.name, e.target.value)}
                  />
                ))}
              </div>
              <div className="mb-2">
                <input
                  type="number"
                  className="form-control mb-2"
                  placeholder="Giá"
                  value={variant.price}
                  onChange={(e) => handleProductVariantChange(index, 'price', e.target.value)}
                />
                <input
                  type="number"
                  className="form-control"
                  placeholder="Số lượng tồn kho"
                  value={variant.stock}
                  onChange={(e) => handleProductVariantChange(index, 'stock', e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => removeProductVariant(index)}
              >
                Xoá biến thể
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-outline-success mb-4" onClick={addProductVariant}>
            Thêm biến thể
          </button>

          <button type="submit" className="btn btn-success">Thêm sản phẩm</button>
        </form>

        <hr className="my-5" />

        <h3>Thêm Danh Mục</h3>
        <form onSubmit={handleCategorySubmit} className="border rounded p-4 bg-white shadow-sm">
          <div className="mb-3">
            <label>Tên danh mục</label>
            <input
              type="text"
              className="form-control"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label>Hình ảnh danh mục</label>
            <input
              type="file"
              className="form-control"
              onChange={handleCategoryImageChange}
              accept="image/*"
            />
            {categoryImagePreview && (
              <img src={categoryImagePreview} alt="Preview" className="img-thumbnail mt-2" style={{ height: '200px' }} />
            )}
          </div>
          <button type="submit" className="btn btn-success">Thêm danh mục</button>
        </form>

        <hr className="my-5" />

        <h3>Danh sách sản phẩm</h3>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Tìm sản phẩm..."
          onChange={(e) => {
            const keyword = e.target.value.toLowerCase();
            setCurrentPage(1); // reset về trang đầu
            setSearchKeyword(keyword);
          }}
        />
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
          {paginatedProducts.map(product => (
            <div key={product._id} className="col">
              <div className="card h-100">
                <img src={product.images?.url} alt={product.name} className="card-img-top" style={{ height: '200px', objectFit: 'cover' }} />
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title mb-1">{product.name}</h5>
                    <small className="text-muted">{product.price.toLocaleString()} đ</small>
                  </div>
                  <button onClick={() => handleRemoveProduct(product._id)} className="btn btn-sm btn-danger">Xoá</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="d-flex justify-content-center mt-3">
          <nav>
            <ul className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <h3 className="mt-5">Danh sách danh mục</h3>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Tìm danh mục..."
          onChange={(e) => {
            const keyword = e.target.value.toLowerCase();
            setCategories(prev => prev.filter(c => c.name.toLowerCase().includes(keyword)));
          }}
        />
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
          {categories.map(cat => (
            <div key={cat._id} className="col">
              <div className="card h-100">
                <img src={cat.image?.[0]?.url} alt={cat.name} className="card-img-top" style={{ height: '150px', objectFit: 'cover' }} />
                <div className="card-body d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">{cat.name}</h5>
                  <button onClick={() => handleDeleteCategory(cat._id)} className="btn btn-sm btn-danger">Xoá</button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default AddProduct;


// import React, { useState, useEffect } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faImage } from '@fortawesome/free-solid-svg-icons';
// import 'bootstrap/dist/css/bootstrap.min.css';

// import Header from '../HomePage/Header';
// import Footer from '../HomePage/Footer';
// import '../Products/style.css';
// import { url } from '../data.js'
// const AddProduct = () => {
//   const [productName, setProductName] = useState('');
//   const [productDescription, setProductDescription] = useState('');
//   const [productCategory, setProductCategory] = useState('');
//   const [productPrice, setProductPrice] = useState('');
//   const [productImages, setProductImages] = useState([null]);
//   const [productImagePreviews, setProductImagePreviews] = useState([]);
//   const [productAttributes, setProductAttributes] = useState([{ name: '' }]);
//   const [productVariants, setProductVariants] = useState([]);
//   const [productError, setProductError] = useState([]);

//   const [categoryName, setCategoryName] = useState('');
//   const [categoryImage, setCategoryImage] = useState(null);
//   const [categoryImagePreview, setCategoryImagePreview] = useState(null);

//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const productsPerPage = 6;
//   const [editProductId, setEditProductId] = useState('');
//   const [editName, setEditName] = useState('');
//   const [editDescription, setEditDescription] = useState('');
//   const [editCategory, setEditCategory] = useState('');
//   const [editPrice, setEditPrice] = useState('');
//   const [editImages, setEditImages] = useState([]);
//   const [editImagePreviews, setEditImagePreviews] = useState([]);
//   const [editAttributes, setEditAttributes] = useState([]);
//   const [editVariants, setEditVariants] = useState([]);
//   const [deletedImages, setDeletedImages] = useState([]);
//   const [deletedVariants, setDeletedVariants] = useState([]);
//   const [editError, setEditError] = useState([]);

//   const [categories, setCategories] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [selectedProduct, setSelectedProduct] = useState(null);

//   useEffect(() => {
//     fetchCategories();
//     fetchProducts();
//     if (productVariants.length === 0) addProductVariant();
//   }, []);

//   useEffect(() => {
//     return () => {
//       productImagePreviews.forEach(preview => {
//         if (preview) URL.revokeObjectURL(preview);
//       });
//       editImagePreviews.forEach(preview => {
//         if (preview) URL.revokeObjectURL(preview);
//       });
//       if (categoryImagePreview) URL.revokeObjectURL(categoryImagePreview);
//     };
//   }, [productImagePreviews, editImagePreviews, categoryImagePreview]);

//   const fetchCategories = async () => {
//     try {
//       const response = await fetch(`${url}/v1/categories/`);
//       const data = await response.json();
//       setCategories(data);
//     } catch (err) {
//       console.error('Lỗi tải danh mục:', err);
//     }
//   };

//   const fetchProducts = async () => {
//     try {
//       const response = await fetch(`${url}/v1/products/`)
//       const data = await response.json();
//       setProducts(data);
//     } catch (err) {
//       console.error('Lỗi tải sản phẩm:', err);
//     }
//   };

//   const validateJson = (data) => {
//     const errors = [];
//     if (!data.name) errors.push('Tên sản phẩm không được để trống');
//     if (!data.description) errors.push('Mô tả sản phẩm không được để trống');
//     if (!data.category_id && !data.category) errors.push('Vui lòng chọn danh mục');
//     if (!data.price || isNaN(data.price) || data.price <= 0) errors.push('Giá sản phẩm phải là số dương');
//     if (!data.variants || data.variants.length === 0) errors.push('Phải có ít nhất một biến thể');
//     else {
//       data.variants.forEach((variant, index) => {
//         if (!variant.price || isNaN(variant.price) || variant.price <= 0)
//           errors.push(`Biến thể ${index + 1}: Giá biến thể phải là số dương`);
//         if (variant.stock === '' || isNaN(variant.stock) || variant.stock < 0)
//           errors.push(`Biến thể ${index + 1}: Số lượng phải là số không âm`);
//         if (!variant.attributes || Object.keys(variant.attributes).length === 0)
//           errors.push(`Biến thể ${index + 1}: Phải có ít nhất một thuộc tính`);
//         else Object.entries(variant.attributes).forEach(([key, value]) => {
//           if (!value) errors.push(`Biến thể ${index + 1}: Giá trị thuộc tính '${key}' không được để trống`);
//         });
//       });
//     }
//     return errors;
//   };

//   const addProductImage = () => {
//     setProductImages([...productImages, null]);
//     setProductImagePreviews([...productImagePreviews, null]);
//   };

//   const handleProductImageChange = (index, e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const newImages = [...productImages];
//       newImages[index] = file;
//       setProductImages(newImages);

//       const newPreviews = [...productImagePreviews];
//       newPreviews[index] = URL.createObjectURL(file);
//       setProductImagePreviews(newPreviews);
//     }
//   };

//   const removeProductImage = (index) => {
//     const newImages = [...productImages];
//     const newPreviews = [...productImagePreviews];
//     const removedImage = newImages.splice(index, 1)[0];
//     const removedPreview = newPreviews.splice(index, 1)[0];
//     if (removedPreview) URL.revokeObjectURL(removedPreview);
//     if (newImages.length === 0) {
//       newImages.push(null);
//       newPreviews.push(null);
//     }
//     setProductImages(newImages);
//     setProductImagePreviews(newPreviews);
//   };

//   const addProductAttribute = () => setProductAttributes([...productAttributes, { name: '' }]);

//   const handleProductAttributeChange = (index, value) => {
//     const newAttributes = [...productAttributes];
//     newAttributes[index].name = value;
//     setProductAttributes(newAttributes);
//     updateProductVariantAttributes();
//   };

//   const removeProductAttribute = (index) => {
//     if (productAttributes.length > 1) {
//       setProductAttributes(productAttributes.filter((_, i) => i !== index));
//       updateProductVariantAttributes();
//     }
//   };

//   const addProductVariant = () => {
//     const newVariant = { price: '', stock: '', attributes: {} };
//     productAttributes.forEach(attr => { if (attr.name) newVariant.attributes[attr.name] = ''; });
//     setProductVariants([...productVariants, newVariant]);
//   };

//   const handleProductVariantChange = (index, field, value) => {
//     const newVariants = [...productVariants];
//     if (field === 'price' || field === 'stock') newVariants[index][field] = value;
//     else newVariants[index].attributes[field] = value;
//     setProductVariants(newVariants);
//   };

//   const removeProductVariant = (index) => {
//     const newVariants = productVariants.filter((_, i) => i !== index);
//     setProductVariants(newVariants.length > 0 ? newVariants : []);
//     if (newVariants.length === 0) addProductVariant();
//   };

//   const updateProductVariantAttributes = () => {
//     const newVariants = productVariants.map(variant => {
//       const updatedAttributes = {};
//       productAttributes.forEach(attr => {
//         if (attr.name) updatedAttributes[attr.name] = variant.attributes[attr.name] || '';
//       });
//       return { ...variant, attributes: updatedAttributes };
//     });
//     setProductVariants(newVariants);
//   };

//   const handleProductSubmit = async (e) => {
//     e.preventDefault();
//     const data = {
//       name: productName.trim(),
//       description: productDescription.trim(),
//       category_id: productCategory,
//       price: productPrice ? parseInt(productPrice) : null,
//       variants: productVariants.map(variant => ({
//         price: parseInt(variant.price) || 0,
//         stock: parseInt(variant.stock) || 0,
//         attributes: variant.attributes,
//       })),
//     };
//     const validImages = productImages.filter(image => image !== null);
//     if (validImages.length === 0) {
//       setProductError(['Vui lòng thêm ít nhất một hình ảnh sản phẩm']);
//       return;
//     }
//     const errors = validateJson(data);
//     if (errors.length > 0) {
//       setProductError(errors);
//       return;
//     }
//     const formData = new FormData();
//     formData.append('data', JSON.stringify(data));
//     validImages.forEach(image => formData.append('images', image));
//     try {
//       const response = await fetch(url + '/v1/products/', {
//         method: 'POST',
//         body: formData,
//         credentials: 'include',
//       });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Lỗi không xác định từ server');
//       }
//       await response.json();
//       alert('Sản phẩm đã được thêm thành công!');

//       // Clear all image previews before resetting
//       productImagePreviews.forEach(preview => {
//         if (preview) URL.revokeObjectURL(preview);
//       });

//       // Reset form with clean image states
//       setProductName('');
//       setProductDescription('');
//       setProductCategory('');
//       setProductPrice('');
//       setProductImages([null]);
//       setProductImagePreviews([]);
//       setProductAttributes([{ name: '' }]);
//       setProductVariants([]);
//       setProductError([]);

//       // Reset file inputs
//       const fileInputs = document.querySelectorAll('input[type="file"]');
//       fileInputs.forEach(input => {
//         input.value = '';
//       });

//       addProductVariant();
//       fetchProducts();
//     } catch (err) {
//       console.error('Lỗi:', err);
//       setProductError([err.message || 'Có lỗi khi thêm sản phẩm!']);
//     }
//   };

//   const handleCategoryImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setCategoryImage(file);
//       const previewUrl = URL.createObjectURL(file);
//       setCategoryImagePreview(previewUrl);
//     }
//   };

//   const handleCategorySubmit = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append('name', categoryName);
//     if (categoryImage) formData.append('images', categoryImage);
//     try {
//       const response = await fetch(url + '/v1/categories/', {
//         method: 'POST',
//         body: formData,
//         credentials: 'include',
//       });
//       if (response.status === 201) {
//         alert('Tạo danh mục thành công!');
//         setCategoryName('');
//         setCategoryImage(null);
//         setCategoryImagePreview(null);
//         fetchCategories();
//       } else {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Lỗi khi thêm danh mục');
//       }
//     } catch (err) {
//       console.error('Lỗi:', err);
//       alert(err.message || 'Có lỗi khi thêm danh mục!');
//     }
//   };

//   const loadProductData = async (productId) => {
//     if (!productId) {
//       resetEditForm();
//       return;
//     }
//     try {
//       const response = await fetch(url + `/v1/products/${productId}`);
//       const product = await response.json();
//       setSelectedProduct(product);
//       setEditProductId(product._id);
//       setEditName(product.name || '');
//       setEditDescription(product.description || '');
//       setEditPrice(product.price || '');
//       setEditCategory(product.category_id || (product.category && product.category[0]?._id) || '');
//       const formattedImages = product.images?.map(img => ({
//         url: img.url || url + `/${img}`,
//         _id: img._id
//       })) || [];
//       setEditImages(formattedImages);
//       setEditImagePreviews(formattedImages.map(img => img.url));
//       const attributes = product.variants?.length > 0
//         ? [...new Set(product.variants.flatMap(v => Object.keys(v.attributes)))].map(name => ({ name }))
//         : [{ name: '' }];
//       setEditAttributes(attributes);
//       const variants = product.variants?.map(v => ({
//         _id: v._id,
//         price: v.price || '',
//         stock: v.stock || '',
//         attributes: { ...v.attributes }
//       })) || [];
//       setEditVariants(variants);
//       setDeletedImages([]);
//       setDeletedVariants([]);
//     } catch (err) {
//       console.error('Lỗi tải dữ liệu sản phẩm:', err);
//       alert('Có lỗi khi tải dữ liệu sản phẩm!');
//     }
//   };

//   const resetEditForm = () => {
//     setEditProductId('');
//     setEditName('');
//     setEditDescription('');
//     setEditCategory('');
//     setEditPrice('');
//     setEditImages([null]);
//     setEditAttributes([{ name: '' }]);
//     setEditVariants([]);
//     setDeletedImages([]);
//     setDeletedVariants([]);
//     setEditError([]);
//     setSelectedProduct(null);
//     setEditImagePreviews([]);
//   };

//   const addEditImage = () => {
//     setEditImages([...editImages, null]);
//     setEditImagePreviews([...editImagePreviews, null]);
//   };

//   const handleEditImageChange = (index, e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const newImages = [...editImages];
//       newImages[index] = file;
//       setEditImages(newImages);
//       const newPreviews = [...editImagePreviews];
//       newPreviews[index] = URL.createObjectURL(file);
//       setEditImagePreviews(newPreviews);
//     }
//   };

//   const removeEditImage = (index) => {
//     const image = editImages[index];
//     if (image?.url) setDeletedImages([...deletedImages, image.url]);
//     const newImages = editImages.filter((_, i) => i !== index);
//     const newPreviews = editImagePreviews.filter((_, i) => i !== index);
//     if (editImagePreviews[index]) URL.revokeObjectURL(editImagePreviews[index]);
//     setEditImages(newImages.length > 0 ? newImages : [null]);
//     setEditImagePreviews(newPreviews.length > 0 ? newPreviews : [null]);
//   };

//   const addEditAttribute = () => setEditAttributes([...editAttributes, { name: '' }]);

//   const handleEditAttributeChange = (index, value) => {
//     const newAttributes = [...editAttributes];
//     newAttributes[index].name = value;
//     setEditAttributes(newAttributes);
//     updateEditVariantAttributes();
//   };

//   const removeEditAttribute = (index) => {
//     if (editAttributes.length > 1) {
//       setEditAttributes(editAttributes.filter((_, i) => i !== index));
//       updateEditVariantAttributes();
//     }
//   };

//   const addEditVariant = () => {
//     const newVariant = { price: '', stock: '', attributes: {} };
//     editAttributes.forEach(attr => { if (attr.name) newVariant.attributes[attr.name] = ''; });
//     setEditVariants([...editVariants, newVariant]);
//   };

//   const handleEditVariantChange = (index, field, value) => {
//     const newVariants = [...editVariants];
//     if (field === 'price' || field === 'stock') newVariants[index][field] = value;
//     else newVariants[index].attributes[field] = value;
//     setEditVariants(newVariants);
//   };

//   const removeEditVariant = (index) => {
//     const variant = editVariants[index];
//     if (variant._id) setDeletedVariants([...deletedVariants, variant._id]);
//     const newVariants = editVariants.filter((_, i) => i !== index);
//     setEditVariants(newVariants.length > 0 ? newVariants : []);
//     if (newVariants.length === 0) addEditVariant();
//   };

//   const updateEditVariantAttributes = () => {
//     const newVariants = editVariants.map(variant => {
//       const updatedAttributes = {};
//       editAttributes.forEach(attr => {
//         if (attr.name) updatedAttributes[attr.name] = variant.attributes[attr.name] || '';
//       });
//       return { ...variant, attributes: updatedAttributes };
//     });
//     setEditVariants(newVariants);
//   };

//   const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     if (!editProductId) {
//       alert('Vui lòng chọn sản phẩm để cập nhật!');
//       return;
//     }
//     const data = {
//       name: editName.trim(),
//       description: editDescription.trim(),
//       category_id: editCategory,
//       price: editPrice ? parseInt(editPrice) : null,
//       variants: editVariants.map(v => ({
//         _id: v._id,
//         price: parseInt(v.price) || 0,
//         stock: parseInt(v.stock) || 0,
//         attributes: v.attributes
//       })),
//       delete: { images: deletedImages, variants: deletedVariants },
//     };
//     const errors = validateJson(data);
//     if (errors.length > 0) {
//       setEditError(errors);
//       return;
//     }
//     const formData = new FormData();
//     formData.append('data', JSON.stringify(data));
//     editImages.forEach(image => {
//       if (image && !image.url) formData.append('images', image);
//     });
//     try {
//       const response = await fetch(url + `/v1/products/${editProductId}`, {
//         method: 'PUT',
//         body: formData,
//         credentials: 'include',
//       });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Lỗi khi cập nhật sản phẩm');
//       }
//       await response.json();
//       alert('Sản phẩm đã được cập nhật thành công!');
//       resetEditForm();
//       fetchProducts();
//     } catch (err) {
//       console.error('Lỗi:', err);
//       setEditError([err.message || 'Có lỗi khi cập nhật sản phẩm!']);
//     }
//   };

//   const handleRemoveProduct = async () => {
//     if (!editProductId) {
//       alert('Vui lòng chọn sản phẩm để xóa!');
//       return;
//     }
//     if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
//     try {
//       const response = await fetch(url + `/v1/products/${editProductId}`, {
//         method: 'DELETE',
//         credentials: 'include',
//       });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Lỗi khi xóa sản phẩm');
//       }
//       alert('Sản phẩm đã được xóa thành công!');
//       resetEditForm();
//       fetchProducts();
//     } catch (err) {
//       console.error('Lỗi:', err);
//       alert(err.message || 'Có lỗi khi xóa sản phẩm!');
//     }
//   };

//   // Lọc và phân trang sản phẩm
//   const filteredProducts = products.filter(product =>
//     product.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );
//   const indexOfLastProduct = currentPage * productsPerPage;
//   const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
//   const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
//   const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="addproducts">
//       <Header />
//       <div className="container my-3">
//         <div>
//           <button className="btn btn-secondary w-100 mb-3" type="button" data-bs-toggle="collapse" data-bs-target="#product-form">
//             Thêm sản phẩm
//           </button>
//           <div className="collapse" id="product-form">
//             <form onSubmit={handleProductSubmit} className="border rounded p-4 bg-white shadow-sm">
//               <div className="row mb-4 w-100">
//                 <div className="col-md-6">
//                   <div className="form-floating mb-3">
//                     <input
//                       type="text"
//                       className="form-control"
//                       value={productName}
//                       onChange={(e) => setProductName(e.target.value)}
//                       placeholder="Tên sản phẩm"
//                       style={{ height: '60px' }}
//                     />
//                     <label style={{ top: '-5px', fontSize: '14px' }}>Tên sản phẩm</label>
//                   </div>
//                 </div>
//                 <div className="col-md-6">
//                   <div className="form-floating mb-3">
//                     <input
//                       type="number"
//                       className="form-control"
//                       value={productPrice}
//                       onChange={(e) => setProductPrice(e.target.value)}
//                       placeholder="Giá sản phẩm"
//                       style={{ height: '60px' }}
//                     />
//                     <label style={{ top: '-5px', fontSize: '14px' }}>Giá sản phẩm</label>
//                   </div>
//                 </div>
//               </div>
//               <div className="row mb-4 w-100">
//                 <div className="col-md-8">
//                   <div className="form-floating mb-3">
//                     <textarea
//                       className="form-control"
//                       value={productDescription}
//                       onChange={(e) => setProductDescription(e.target.value)}
//                       placeholder="Mô tả sản phẩm"
//                       style={{ height: '220px' }}
//                     />
//                     <label style={{ top: '-5px', fontSize: '14px' }}>Mô tả sản phẩm</label>
//                   </div>
//                 </div>
//                 <div className="col-md-4">
//                   <div className="form-floating mb-3">
//                     <select
//                       className="form-select"
//                       value={productCategory}
//                       onChange={(e) => setProductCategory(e.target.value)}
//                       style={{ height: '60px' }}
//                     >
//                       <option value="">Chọn danh mục...</option>
//                       {categories.map(cat => (
//                         <option key={cat._id} value={cat._id}>{cat.name}</option>
//                       ))}
//                     </select>
//                     <label style={{ top: '-5px', fontSize: '14px' }}>Danh mục</label>
//                   </div>
//                 </div>
//               </div>
//               <div className="card mb-4">
//                 <div className="card-header d-flex justify-content-between align-items-center w-100">
//                   <h5 className="mb-0">Hình ảnh sản phẩm</h5>
//                   <button type="button" onClick={addProductImage} className="btn btn-primary btn-sm">
//                     <i className="fas fa-plus"></i> Thêm hình
//                   </button>
//                 </div>
//                 <div className="card-body">
//                   <div className="row">
//                     {productImages.map((image, index) => (
//                       <div key={index} className="col-md-4 mb-3">
//                         <div className="card h-100">
//                           <div className="card-body">
//                             <div className="image-preview mb-3" style={{ height: '200px', background: '#f8f9fa' }}>
//                               {productImagePreviews[index] ? (
//                                 <img
//                                   src={productImagePreviews[index]}
//                                   alt="Preview"
//                                   className="img-fluid h-100 w-100"
//                                   style={{ objectFit: 'contain' }}
//                                 />
//                               ) : (
//                                 <div className="d-flex align-items-center justify-content-center h-100 bg-light">
//                                   <FontAwesomeIcon icon={faImage} size="2x" className="text-muted" />
//                                 </div>
//                               )}
//                             </div>
//                             <div className="input-group">
//                               <input
//                                 type="file"
//                                 className="form-control"
//                                 onChange={(e) => handleProductImageChange(index, e)}
//                                 accept="image/*"
//                               />
//                               <button
//                                 type="button"
//                                 className="btn btn-outline-danger"
//                                 onClick={() => removeProductImage(index)}
//                               >
//                                 Xóa
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//               <div className="card mb-4">
//                 <div className="card-header d-flex justify-content-between align-items-center">
//                   <h5 className="mb-0">Thuộc tính sản phẩm</h5>
//                   <button type="button" onClick={addProductAttribute} className="btn btn-primary btn-sm">
//                     <i className="fas fa-plus"></i> Thêm thuộc tính
//                   </button>
//                 </div>
//                 <div className="card-body">
//                   {productAttributes.map((attr, index) => (
//                     <div key={index} className="input-group mb-3">
//                       <input
//                         type="text"
//                         className="form-control"
//                         value={attr.name}
//                         onChange={(e) => handleProductAttributeChange(index, e.target.value)}
//                         placeholder="Tên thuộc tính (VD: color, size)"
//                         style={{ height: '50px' }}
//                       />
//                       <button
//                         type="button"
//                         className="btn btn-outline-danger"
//                         onClick={() => removeProductAttribute(index)}
//                       >
//                         Xóa
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//               <div className="card mb-4">
//                 <div className="card-header d-flex justify-content-between align-items-center">
//                   <h5 className="mb-0">Biến thể sản phẩm</h5>
//                   <button type="button" onClick={addProductVariant} className="btn btn-primary btn-sm">
//                     <i className="fas fa-plus"></i> Thêm biến thể
//                   </button>
//                 </div>
//                 <div className="card-body">
//                   {productVariants.map((variant, vIndex) => (
//                     <div key={vIndex} className="card mb-3">
//                       <div className="card-body">
//                         <div className="row">
//                           <div className="col-md-6">
//                             <div className="form-floating mb-3">
//                               <input
//                                 type="number"
//                                 className="form-control"
//                                 value={variant.price}
//                                 onChange={(e) => handleProductVariantChange(vIndex, 'price', e.target.value)}
//                                 placeholder="Giá biến thể"
//                                 style={{ height: '60px' }}
//                               />
//                               <label style={{ top: '-5px', fontSize: '14px' }}>Giá biến thể</label>
//                             </div>
//                           </div>
//                           <div className="col-md-6">
//                             <div className="form-floating mb-3">
//                               <input
//                                 type="number"
//                                 className="form-control"
//                                 value={variant.stock}
//                                 onChange={(e) => handleProductVariantChange(vIndex, 'stock', e.target.value)}
//                                 placeholder="Số lượng"
//                                 style={{ height: '60px' }}
//                               />
//                               <label style={{ top: '-5px', fontSize: '14px' }}>Số lượng</label>
//                             </div>
//                           </div>
//                         </div>
//                         {productAttributes.map((attr, aIndex) => attr.name && (
//                           <div key={aIndex} className="form-floating mb-3">
//                             <input
//                               type="text"
//                               className="form-control"
//                               value={variant.attributes[attr.name] || ''}
//                               onChange={(e) => handleProductVariantChange(vIndex, attr.name, e.target.value)}
//                               placeholder={`Giá trị ${attr.name}`}
//                               style={{ height: '60px' }}
//                             />
//                             <label style={{ top: '-5px', fontSize: '14px' }}>{attr.name}</label>
//                           </div>
//                         ))}
//                         <button
//                           type="button"
//                           className="btn btn-outline-danger"
//                           onClick={() => removeProductVariant(vIndex)}
//                         >
//                           Xóa biến thể
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//               {productError.length > 0 && (
//                 <div className="alert alert-danger">
//                   <ul className="mb-0">
//                     {productError.map((err, idx) => (
//                       <li key={idx}>{err}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//               <button type="submit" className="btn btn-primary">
//                 <i className="fas fa-save"></i> Lưu sản phẩm
//               </button>
//             </form>
//           </div>
//         </div>

//         <div className="my-4">
//           <button className="btn btn-secondary w-100 mb-3" type="button" data-bs-toggle="collapse" data-bs-target="#category-form">
//             Thêm danh mục
//           </button>
//           <div className="collapse" id="category-form">
//             <form onSubmit={handleCategorySubmit} className="border rounded p-4 bg-white shadow-sm">
//               <div className="form-floating mb-3">
//                 <input
//                   type="text"
//                   className="form-control"
//                   value={categoryName}
//                   onChange={(e) => setCategoryName(e.target.value)}
//                   placeholder="Tên danh mục"
//                   style={{ height: '60px' }}
//                 />
//                 <label style={{ top: '-5px', fontSize: '14px' }}>Tên danh mục</label>
//               </div>
//               <div className="mb-3">
//                 <div className="image-preview mb-3" style={{ height: '200px', background: '#f8f9fa' }}>
//                   {categoryImagePreview ? (
//                     <img
//                       src={categoryImagePreview}
//                       alt="Preview"
//                       className="img-fluid h-100 w-100"
//                       style={{ objectFit: 'contain' }}
//                     />
//                   ) : (
//                     <div className="d-flex align-items-center justify-content-center h-100 bg-light">
//                       <FontAwesomeIcon icon={faImage} size="2x" className="text-muted" />
//                     </div>
//                   )}
//                 </div>
//                 <input
//                   type="file"
//                   className="form-control"
//                   onChange={handleCategoryImageChange}
//                   accept="image/*"
//                 />
//               </div>
//               <button type="submit" className="btn btn-primary">
//                 <i className="fas fa-save"></i> Lưu danh mục
//               </button>
//             </form>
//           </div>
//         </div>

//         <div className="my-4">
//           <button className="btn btn-secondary w-100 mb-3" type="button" data-bs-toggle="collapse" data-bs-target="#edit-product-form">
//             Sửa sản phẩm
//           </button>
//           <div className="collapse" id="edit-product-form">
//             <div className="mb-3">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Tìm kiếm sản phẩm..."
//                 value={searchTerm}
//                 onChange={(e) => {
//                   setSearchTerm(e.target.value);
//                   setCurrentPage(1);
//                 }}
//                 style={{ height: '60px' }}
//               />
//             </div>
//             <div className="row">
//               {currentProducts.length > 0 ? (
//                 currentProducts.map(product => (
//                   <div key={product._id} className="col-md-2 mb-3">
//                     <div
//                       className={`card h-100 ${selectedProduct?._id === product._id ? 'border-primary' : ''}`}
//                       onClick={() => loadProductData(product._id)}
//                       style={{ cursor: 'pointer' }}
//                     >
//                       <img
//                         src={product.images?.url || '/placeholder.jpg'}
//                         className="card-img-top"
//                         alt={product.name}
//                         style={{ height: '200px', objectFit: 'cover' }}
//                       />
//                       <div className="card-body">
//                         <h5 className="card-title">{product.name}</h5>
//                         <p className="card-text text-truncate">{product.description}</p>
//                         <p className="card-text">
//                           <small className="text-muted">
//                             Giá: {product.price?.toLocaleString('vi-VN')}đ
//                           </small>
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="col-12 text-center">
//                   <p>Không tìm thấy sản phẩm nào.</p>
//                 </div>
//               )}
//             </div>
//             {totalPages > 1 && (
//               <nav>
//                 <ul className="pagination justify-content-center">
//                   <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
//                     <button className="page-link" onClick={() => paginate(currentPage - 1)}>
//                       Trước
//                     </button>
//                   </li>
//                   {Array.from({ length: totalPages }, (_, i) => (
//                     <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
//                       <button className="page-link" onClick={() => paginate(i + 1)}>
//                         {i + 1}
//                       </button>
//                     </li>
//                   ))}
//                   <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
//                     <button className="page-link" onClick={() => paginate(currentPage + 1)}>
//                       Sau
//                     </button>
//                   </li>
//                 </ul>
//               </nav>
//             )}
//             {selectedProduct && (
//               <form onSubmit={handleEditSubmit} className="border rounded p-4 bg-white shadow-sm mt-4">
//                 <div className="row mb-4">
//                   <div className="col-md-6">
//                     <div className="form-floating mb-3">
//                       <input
//                         type="text"
//                         className="form-control"
//                         value={editName}
//                         onChange={(e) => setEditName(e.target.value)}
//                         placeholder="Tên sản phẩm"
//                         style={{ height: '60px' }}
//                       />
//                       <label style={{ top: '-5px', fontSize: '14px' }}>Tên sản phẩm</label>
//                     </div>
//                   </div>
//                   <div className="col-md-6">
//                     <div className="form-floating mb-3">
//                       <input
//                         type="number"
//                         className="form-control"
//                         value={editPrice}
//                         onChange={(e) => setEditPrice(e.target.value)}
//                         placeholder="Giá sản phẩm"
//                         style={{ height: '60px' }}
//                       />
//                       <label style={{ top: '-5px', fontSize: '14px' }}>Giá sản phẩm</label>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="row mb-4">
//                   <div className="col-md-8">
//                     <div className="form-floating mb-3">
//                       <textarea
//                         className="form-control"
//                         value={editDescription}
//                         onChange={(e) => setEditDescription(e.target.value)}
//                         placeholder="Mô tả sản phẩm"
//                         style={{ height: '220px' }}
//                       />
//                       <label style={{ top: '-5px', fontSize: '14px' }}>Mô tả sản phẩm</label>
//                     </div>
//                   </div>
//                   <div className="col-md-4">
//                     <div className="form-floating mb-3">
//                       <select
//                         className="form-select"
//                         value={editCategory}
//                         onChange={(e) => setEditCategory(e.target.value)}
//                         style={{ height: '60px' }}
//                       >
//                         <option value="">Chọn danh mục...</option>
//                         {categories.map(cat => (
//                           <option key={cat._id} value={cat._id}>{cat.name}</option>
//                         ))}
//                       </select>
//                       <label style={{ top: '-5px', fontSize: '14px' }}>Danh mục</label>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="card mb-4">
//                   <div className="card-header d-flex justify-content-between align-items-center">
//                     <h5 className="mb-0">Hình ảnh sản phẩm</h5>
//                     <button type="button" onClick={addEditImage} className="btn btn-primary btn-sm">
//                       <i className="fas fa-plus"></i> Thêm hình
//                     </button>
//                   </div>
//                   <div className="card-body">
//                     <div className="row">
//                       {editImages.map((image, index) => (
//                         <div key={index} className="col-md-4 mb-3">
//                           <div className="card h-100">
//                             <div className="card-body">
//                               <div className="image-preview mb-3" style={{ height: '200px', background: '#f8f9fa' }}>
//                                 {image?.url ? (
//                                   <img
//                                     src={image.url}
//                                     alt="Preview"
//                                     className="img-fluid h-100 w-100"
//                                     style={{ objectFit: 'contain' }}
//                                   />
//                                 ) : editImagePreviews[index] ? (
//                                   <img
//                                     src={editImagePreviews[index]}
//                                     alt="Preview"
//                                     className="img-fluid h-100 w-100"
//                                     style={{ objectFit: 'contain' }}
//                                   />
//                                 ) : (
//                                   <div className="d-flex align-items-center justify-content-center h-100 bg-light">
//                                     <FontAwesomeIcon icon={faImage} size="2x" className="text-muted" />
//                                   </div>
//                                 )}
//                               </div>
//                               <div className="input-group">
//                                 {!image?.url && (
//                                   <input
//                                     type="file"
//                                     className="form-control"
//                                     onChange={(e) => handleEditImageChange(index, e)}
//                                     accept="image/*"
//                                   />
//                                 )}
//                                 <button
//                                   type="button"
//                                   className="btn btn-outline-danger"
//                                   onClick={() => removeEditImage(index)}
//                                 >
//                                   Xóa
//                                 </button>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="card mb-4">
//                   <div className="card-header d-flex justify-content-between align-items-center">
//                     <h5 className="mb-0">Thuộc tính sản phẩm</h5>
//                     <button type="button" onClick={addEditAttribute} className="btn btn-primary btn-sm">
//                       <i className="fas fa-plus"></i> Thêm thuộc tính
//                     </button>
//                   </div>
//                   <div className="card-body">
//                     {editAttributes.map((attr, index) => (
//                       <div key={index} className="input-group mb-3">
//                         <input
//                           type="text"
//                           className="form-control"
//                           value={attr.name}
//                           onChange={(e) => handleEditAttributeChange(index, e.target.value)}
//                           placeholder="Tên thuộc tính (VD: color, size)"
//                           style={{ height: '50px' }}
//                         />
//                         <button
//                           type="button"
//                           className="btn btn-outline-danger"
//                           onClick={() => removeEditAttribute(index)}
//                         >
//                           Xóa
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 <div className="card mb-4">
//                   <div className="card-header d-flex justify-content-between align-items-center">
//                     <h5 className="mb-0">Biến thể sản phẩm</h5>
//                     <button type="button" onClick={addEditVariant} className="btn btn-primary btn-sm">
//                       <i className="fas fa-plus"></i> Thêm biến thể
//                     </button>
//                   </div>
//                   <div className="card-body">
//                     {editVariants.map((variant, vIndex) => (
//                       <div key={vIndex} className="card mb-3">
//                         <div className="card-body">
//                           <div className="row">
//                             <div className="col-md-6">
//                               <div className="form-floating mb-3">
//                                 <input
//                                   type="number"
//                                   className="form-control"
//                                   value={variant.price}
//                                   onChange={(e) => handleEditVariantChange(vIndex, 'price', e.target.value)}
//                                   placeholder="Giá biến thể"
//                                   style={{ height: '60px' }}
//                                 />
//                                 <label style={{ top: '-5px', fontSize: '14px' }}>Giá biến thể</label>
//                               </div>
//                             </div>
//                             <div className="col-md-6">
//                               <div className="form-floating mb-3">
//                                 <input
//                                   type="number"
//                                   className="form-control"
//                                   value={variant.stock}
//                                   onChange={(e) => handleEditVariantChange(vIndex, 'stock', e.target.value)}
//                                   placeholder="Số lượng"
//                                   style={{ height: '60px' }}
//                                 />
//                                 <label style={{ top: '-5px', fontSize: '14px' }}>Số lượng</label>
//                               </div>
//                             </div>
//                           </div>
//                           {editAttributes.map((attr, aIndex) => attr.name && (
//                             <div key={aIndex} className="form-floating mb-3">
//                               <input
//                                 type="text"
//                                 className="form-control"
//                                 value={variant.attributes[attr.name] || ''}
//                                 onChange={(e) => handleEditVariantChange(vIndex, attr.name, e.target.value)}
//                                 placeholder={`Giá trị ${attr.name}`}
//                                 style={{ height: '60px' }}
//                               />
//                               <label style={{ top: '-5px', fontSize: '14px' }}>{attr.name}</label>
//                             </div>
//                           ))}
//                           <button
//                             type="button"
//                             className="btn btn-outline-danger"
//                             onClick={() => removeEditVariant(vIndex)}
//                           >
//                             Xóa biến thể
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 {editError.length > 0 && (
//                   <div className="alert alert-danger">
//                     <ul className="mb-0">
//                       {editError.map((err, idx) => (
//                         <li key={idx}>{err}</li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//                 <div className="mt-4">
//                   <button type="submit" className="btn btn-primary me-2">
//                     <i className="fas fa-save"></i> Lưu thay đổi
//                   </button>
//                   <button type="button" className="btn btn-danger" onClick={handleRemoveProduct}>
//                     Xóa sản phẩm
//                   </button>
//                 </div>
//               </form>
//             )}
//           </div>
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default AddProduct;