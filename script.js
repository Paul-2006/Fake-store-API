const API_URL = "https://fakestoreapi.com/products";

let products = [];
let editingId = null;
let cartCount = 0;

const productGrid = document.getElementById("productGrid");
const productForm = document.getElementById("productForm");
const message = document.getElementById("message");
const formTitle = document.getElementById("formTitle");
const detailsBox = document.getElementById("detailsBox");
const cartCountText = document.getElementById("cartCount");

function showPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active-page");
  });
  document.getElementById(pageId).classList.add("active-page");
}

async function loadProducts() {
  productGrid.innerHTML = "<p>Loading products...</p>";

  try {
    const response = await fetch(API_URL);
    products = await response.json();
    showProducts(products);
  } catch (error) {
    productGrid.innerHTML = "<p>Could not load products.</p>";
  }
}

function showProducts(list) {
  productGrid.innerHTML = "";

  list.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <div class="product-card-content">
        <h3>${product.title}</h3>
        <p><b>Price:</b> $${product.price}</p>
        <p><b>Category:</b> ${product.category}</p>
        <div class="card-buttons">
          <button onclick="showDetails(${product.id})">Details</button>
          <button class="cart-btn" onclick="addToCart()">Add to Cart</button>
          <button class="edit-btn" onclick="startEdit(${product.id})">Edit</button>
          <button class="delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
        </div>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

function addToCart() {
  cartCount = cartCount + 1;
  cartCountText.textContent = cartCount;
}

function openAddPage() {
  resetForm();
  showPage("formPage");
}

function getFormData() {
  return {
    title: document.getElementById("title").value,
    price: Number(document.getElementById("price").value),
    category: document.getElementById("category").value,
    image: document.getElementById("image").value,
    description: document.getElementById("description").value
  };
}

function setFormData(product) {
  document.getElementById("title").value = product.title;
  document.getElementById("price").value = product.price;
  document.getElementById("category").value = product.category;
  document.getElementById("image").value = product.image;
  document.getElementById("description").value = product.description;
}

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = getFormData();

  if (editingId) {
    await fetch(`${API_URL}/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    products = products.map((product) =>
      product.id === editingId ? { ...product, ...data } : product
    );
    message.textContent = "Product updated.";
  } else {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const created = await response.json();

    products.unshift({
      ...data,
      id: created.id || Date.now()
    });
    message.textContent = "Product added.";
  }

  resetForm();
  showProducts(products);
  showPage("productsPage");
});

function startEdit(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  editingId = id;
  formTitle.textContent = "Update Product";
  setFormData(product);
  message.textContent = `Editing: ${product.title}`;
  showPage("formPage");
}

async function deleteProduct(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  products = products.filter((product) => product.id !== id);
  showProducts(products);
}

function resetForm() {
  editingId = null;
  formTitle.textContent = "Add Product";
  productForm.reset();
  message.textContent = "";
}

function showDetails(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  detailsBox.innerHTML = `
    <img src="${product.image}" alt="${product.title}">
    <div>
      <h2>${product.title}</h2>
      <p><b>Price:</b> $${product.price}</p>
      <p><b>Category:</b> ${product.category}</p>
      <p>${product.description}</p>
    </div>
  `;
  showPage("detailsPage");
}

document.getElementById("cancelBtn").addEventListener("click", () => {
  resetForm();
  showPage("productsPage");
});

document.getElementById("searchBtn").addEventListener("click", () => {
  const text = document.getElementById("searchInput").value.toLowerCase();
  const filtered = products.filter((product) =>
    product.title.toLowerCase().includes(text) ||
    product.category.toLowerCase().includes(text)
  );
  showProducts(filtered);
});

loadProducts();
