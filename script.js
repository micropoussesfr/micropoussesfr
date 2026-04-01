// Load products from JSON
fetch('products.json')
  .then(res => res.json())
  .then(products => {
    window.products = products;
    renderProducts(products);
    loadCart();
  });

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300x180?text=Photo+à+venir'">
      <h3>${p.name}</h3>
      <div class="price">${p.price.toFixed(2)} € / 100g</div>
      <button onclick="addToCart(${p.id})">Ajouter au panier</button>
    </div>
  `).join('');
}

// Cart functions
let cart = [];

function addToCart(productId) {
  const product = window.products.find(p => p.id === productId);
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
}

function updateQuantity(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) removeFromCart(productId);
    else saveCart();
    updateCartUI();
  }
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  document.getElementById('cartCount').innerText = cart.reduce((sum, i) => sum + i.quantity, 0);
}

function loadCart() {
  const saved = localStorage.getItem('cart');
  if (saved) {
    cart = JSON.parse(saved);
    updateCartUI();
  }
}

function updateCartUI() {
  const cartItemsDiv = document.getElementById('cartItems');
  const totalSpan = document.getElementById('cartTotal');
  const countSpan = document.getElementById('cartCount');
  if (!cartItemsDiv) return;

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p>Votre panier est vide.</p>';
    totalSpan.innerText = '0';
    countSpan.innerText = '0';
    return;
  }

  let total = 0;
  cartItemsDiv.innerHTML = cart.map(item => {
    total += item.price * item.quantity;
    return `
      <div class="cart-item">
        <div>${item.name} x ${item.quantity}</div>
        <div>${(item.price * item.quantity).toFixed(2)} €
          <button onclick="updateQuantity(${item.id}, -1)">-</button>
          <button onclick="updateQuantity(${item.id}, 1)">+</button>
          <button onclick="removeFromCart(${item.id})">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
  totalSpan.innerText = total.toFixed(2);
  countSpan.innerText = cart.reduce((sum, i) => sum + i.quantity, 0);
}

// Cart sidebar UI
const cartIcon = document.getElementById('cartIcon');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');

cartIcon.addEventListener('click', () => {
  cartSidebar.classList.add('open');
});
closeCart.addEventListener('click', () => {
  cartSidebar.classList.remove('open');
});

// Checkout – show payment options
document.getElementById('checkoutBtn').addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Votre panier est vide.');
    return;
  }
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  // You can replace these URLs with your actual payment links
  const paypalLink = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=YOUR_EMAIL&amount=${total}&currency_code=EUR&item_name=Commande+Micro-Pousses+Alsace`;
  const stripeLink = `https://buy.stripe.com/YOUR_LINK`; // create a Stripe payment link
  const cryptoAddress = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"; // example BTC address

  const message = `Choisissez votre moyen de paiement :
- PayPal : ${paypalLink}
- Carte bancaire (Stripe) : ${stripeLink}
- Crypto (BTC) : ${cryptoAddress}
Après paiement, nous vous contacterons pour organiser la livraison.`;
  alert(message);
  // Optionally redirect to PayPal directly
  // window.open(paypalLink, '_blank');
});

// Contact form with Formspree
const form = document.getElementById('contactForm');
const feedback = document.getElementById('formFeedback');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        feedback.innerHTML = '✅ Message envoyé ! Nous vous répondrons rapidement.';
        form.reset();
      } else {
        feedback.innerHTML = '❌ Erreur, veuillez réessayer.';
      }
    } catch (error) {
      feedback.innerHTML = '❌ Erreur réseau.';
    }
    setTimeout(() => feedback.innerHTML = '', 5000);
  });
}
