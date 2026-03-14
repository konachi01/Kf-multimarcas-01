import { useMemo, useState } from "react";
import logo from "./assets/logo-kf.jpg";

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Camiseta Essential Black",
    category: "Camisetas",
    price: 69.9,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    sizes: ["P", "M", "G", "GG"],
    badge: "Mais vendido",
    description: "Camiseta masculina versátil com visual moderno para o dia a dia.",
    promo: false,
    oldPrice: null,
  },
  {
    id: 2,
    name: "Camisa Premium Slim",
    category: "Camisas",
    price: 119.9,
    image:
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1200&q=80",
    sizes: ["M", "G", "GG"],
    badge: "Nova coleção",
    description: "Camisa com corte elegante para ocasiões casuais e sociais.",
    promo: true,
    oldPrice: 149.9,
  },
  {
    id: 3,
    name: "Conjunto Urban Style",
    category: "Conjuntos",
    price: 159.9,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    sizes: ["P", "M", "G"],
    badge: "Tendência",
    description: "Conjunto moderno para quem quer presença e conforto no look.",
    promo: false,
    oldPrice: null,
  },
  {
    id: 4,
    name: "Boné Signature",
    category: "Acessórios",
    price: 49.9,
    image:
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=80",
    sizes: ["Único"],
    badge: "Oferta",
    description: "Acessório premium para completar o visual masculino.",
    promo: true,
    oldPrice: 69.9,
  },
];

function currency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value) || 0);
}

function emptyProduct() {
  return {
    id: null,
    name: "",
    category: "Camisetas",
    price: "",
    oldPrice: "",
    image: "",
    sizes: "P,M,G,GG",
    badge: "Novo",
    description: "",
    promo: false,
  };
}

export default function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState(() =>
    Object.fromEntries(INITIAL_PRODUCTS.map((p) => [p.id, p.sizes[0]]))
  );

  const [adminOpen, setAdminOpen] = useState(false);
  const [adminLogged, setAdminLogged] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "admin@kf.com",
    password: "123456",
  });
  const [loginError, setLoginError] = useState("");
  const [form, setForm] = useState(emptyProduct());
  const [editingId, setEditingId] = useState(null);

  const categories = ["Todos", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch =
        selectedCategory === "Todos" || product.category === selectedCategory;
      const searchMatch = product.name.toLowerCase().includes(search.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [products, selectedCategory, search]);

  const addToCart = (product) => {
    const chosenSize = selectedSizes[product.id] || product.sizes[0] || "Único";

    setCart((current) => {
      const existing = current.find(
        (item) => item.id === product.id && item.size === chosenSize
      );

      if (existing) {
        return current.map((item) =>
          item.id === product.id && item.size === chosenSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          size: chosenSize,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (id, size, amount) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id === id && item.size === size) {
            return { ...item, quantity: item.quantity + amount };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const whatsappItems = cart
    .map(
      (item) =>
        `• ${item.name} | Tamanho: ${item.size} | Qtd: ${item.quantity} | ${currency(
          item.price * item.quantity
        )}`
    )
    .join("\\n");

  const checkoutLink = `https://wa.me/5527996992922?text=${encodeURIComponent(
    cart.length
      ? `Olá! Quero fechar um pedido na KF Multimarcas:\\n\\n${whatsappItems}\\n\\nTotal: ${currency(totalPrice)}`
      : "Olá! Quero atendimento da KF Multimarcas."
  )}`;

  const handleLogin = () => {
    if (loginData.email === "admin@kf.com" && loginData.password === "123456") {
      setAdminLogged(true);
      setLoginError("");
      return;
    }
    setLoginError("Email ou senha inválidos na demonstração.");
  };

  const resetForm = () => {
    setForm(emptyProduct());
    setEditingId(null);
  };

  const publishProduct = () => {
    if (!form.name || !form.category || !form.price || !form.image) return;

    const parsedSizes = String(form.sizes)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const prepared = {
      id: editingId || Date.now(),
      name: form.name,
      category: form.category,
      price: Number(form.price),
      oldPrice: form.promo && form.oldPrice ? Number(form.oldPrice) : null,
      image: form.image,
      sizes: parsedSizes.length ? parsedSizes : ["Único"],
      badge: form.badge || "Novo",
      description: form.description || "Novo produto da coleção KF Multimarcas.",
      promo: Boolean(form.promo),
    };

    if (editingId) {
      setProducts((current) =>
        current.map((item) => (item.id === editingId ? prepared : item))
      );
    } else {
      setProducts((current) => [prepared, ...current]);
    }

    setSelectedSizes((current) => ({
      ...current,
      [prepared.id]: prepared.sizes[0] || "Único",
    }));

    resetForm();
  };

  const editProduct = (product) => {
    setAdminOpen(true);
    setAdminLogged(true);
    setEditingId(product.id);
    setForm({
      id: product.id,
      name: product.name,
      category: product.category,
      price: String(product.price),
      oldPrice: product.oldPrice ? String(product.oldPrice) : "",
      image: product.image,
      sizes: product.sizes.join(","),
      badge: product.badge,
      description: product.description,
      promo: product.promo,
    });
  };

  const duplicateProduct = (product) => {
    setEditingId(null);
    setForm({
      id: null,
      name: `${product.name} Cópia`,
      category: product.category,
      price: String(product.price),
      oldPrice: product.oldPrice ? String(product.oldPrice) : "",
      image: product.image,
      sizes: product.sizes.join(","),
      badge: product.badge,
      description: product.description,
      promo: product.promo,
    });
  };

  const deleteProduct = (id) => {
    setProducts((current) => current.filter((item) => item.id !== id));
    setCart((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
  };

  const togglePromo = (id) => {
    setProducts((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const nextPromo = !item.promo;
        return {
          ...item,
          promo: nextPromo,
          oldPrice: nextPromo
            ? item.oldPrice || Number((item.price * 1.25).toFixed(2))
            : null,
          badge: nextPromo
            ? "Promoção"
            : item.badge === "Promoção"
            ? "Novo"
            : item.badge,
        };
      })
    );
  };

  return (
    <div className="page">
      <header className="header">
        <div className="brand">
          <div className="logo-wrap">
            <img src={logo} alt="KF Multimarcas" className="logo-img" />
          </div>
          <div>
            <p className="brand-title">KF MULTIMARCAS</p>
            <p className="brand-subtitle">Loja virtual masculina</p>
          </div>
        </div>

        <div className="search-desktop">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produto"
            className="input"
          />
        </div>

        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setAdminOpen((v) => !v)}>
            Painel admin
          </button>
          <a href="#carrinho" className="btn btn-primary">
            Carrinho ({totalItems})
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-grid">
          <div>
            <span className="pill">Loja virtual pronta para vender</span>
            <h1>Compre online na KF Multimarcas com catálogo, carrinho e pedido rápido.</h1>
            <p>
              Escolha os produtos, selecione o tamanho, adicione ao carrinho e finalize
              seu pedido direto no WhatsApp da loja.
            </p>

            <div className="hero-actions">
              <a href="#produtos" className="btn btn-primary">Ver produtos</a>
              <a href={checkoutLink} target="_blank" rel="noreferrer" className="btn btn-secondary">
                Finalizar no WhatsApp
              </a>
            </div>
          </div>

          <div className="hero-cards">
            <div className="card light">
              <p className="small-label">Oferta da semana</p>
              <h2>Até 20% off</h2>
              <p>Em peças selecionadas da coleção masculina.</p>
            </div>
            <div className="card dark">
              <p className="small-label">Atendimento</p>
              <h2>(27) 99699-2922</h2>
              <p>Loja física em Pinheiros - ES com atendimento rápido pelo WhatsApp.</p>
            </div>
          </div>
        </div>
      </section>

      {adminOpen && (
        <section className="admin-section">
          {!adminLogged ? (
            <div className="login-box">
              <p className="section-label">Acesso do dono</p>
              <h2>Login do painel admin</h2>
              <p>Nesta demonstração, use o login abaixo para entrar no painel.</p>

              <div className="form-grid one">
                <input
                  value={loginData.email}
                  onChange={(e) => setLoginData((c) => ({ ...c, email: e.target.value }))}
                  className="input"
                  placeholder="Email"
                />
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData((c) => ({ ...c, password: e.target.value }))}
                  className="input"
                  placeholder="Senha"
                />
                {loginError ? <p className="error">{loginError}</p> : null}
                <button onClick={handleLogin} className="btn btn-primary full">Entrar no painel</button>
                <div className="demo-box">Demo: admin@kf.com | 123456</div>
              </div>
            </div>
          ) : (
            <div className="admin-grid">
              <div className="panel">
                <div className="row space">
                  <div>
                    <p className="section-label">Painel admin</p>
                    <h2>{editingId ? "Editar produto" : "Adicionar produto"}</h2>
                  </div>
                  <button onClick={resetForm} className="btn btn-secondary">Limpar</button>
                </div>

                <div className="form-grid">
                  <input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} placeholder="Nome do produto" className="input" />
                  <input value={form.category} onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))} placeholder="Categoria" className="input" />
                  <input value={form.price} onChange={(e) => setForm((c) => ({ ...c, price: e.target.value }))} type="number" placeholder="Preço atual" className="input" />
                  <input value={form.oldPrice} onChange={(e) => setForm((c) => ({ ...c, oldPrice: e.target.value }))} type="number" placeholder="Preço antigo" className="input" />
                  <input value={form.image} onChange={(e) => setForm((c) => ({ ...c, image: e.target.value }))} placeholder="Link da foto" className="input span-2" />
                  <input value={form.sizes} onChange={(e) => setForm((c) => ({ ...c, sizes: e.target.value }))} placeholder="Tamanhos: P,M,G,GG" className="input" />
                  <input value={form.badge} onChange={(e) => setForm((c) => ({ ...c, badge: e.target.value }))} placeholder="Selo" className="input" />
                  <label className="checkbox span-2">
                    <input type="checkbox" checked={form.promo} onChange={(e) => setForm((c) => ({ ...c, promo: e.target.checked }))} />
                    Marcar produto em promoção
                  </label>
                  <textarea value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} placeholder="Descrição do produto" className="input textarea span-2" />
                  <button onClick={publishProduct} className="btn btn-primary full span-2">
                    {editingId ? "Salvar alterações" : "Publicar produto"}
                  </button>
                </div>
              </div>

              <div className="panel">
                <div className="row space">
                  <div>
                    <p className="section-label">Produtos cadastrados</p>
                    <h2>Gerenciar vitrine</h2>
                  </div>
                  <button
                    onClick={() => {
                      setAdminLogged(false);
                      setAdminOpen(false);
                    }}
                    className="btn btn-secondary"
                  >
                    Sair
                  </button>
                </div>

                <div className="list">
                  {products.map((product) => (
                    <div key={product.id} className="product-admin-item">
                      <div className="row">
                        <img src={product.image} alt={product.name} className="thumb" />
                        <div className="grow">
                          <div className="row">
                            <h3>{product.name}</h3>
                            {product.promo ? <span className="badge">Promoção</span> : null}
                          </div>
                          <p className="muted">{product.category}</p>
                          <p>{currency(product.price)}</p>
                        </div>
                      </div>
                      <div className="mini-grid">
                        <button onClick={() => editProduct(product)} className="btn btn-secondary small">Editar</button>
                        <button onClick={() => deleteProduct(product.id)} className="btn btn-secondary small">Excluir</button>
                        <button onClick={() => togglePromo(product.id)} className="btn btn-secondary small">Marcar promoção</button>
                        <button onClick={() => duplicateProduct(product)} className="btn btn-secondary small">Duplicar base</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      <main className="container">
        <div className="search-mobile">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produto"
            className="input"
          />
        </div>

        <section id="produtos">
          <div className="row categories-row">
            <div>
              <p className="section-label">Produtos</p>
              <h2>Loja virtual da KF Multimarcas</h2>
            </div>
            <div className="categories">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`chip ${selectedCategory === category ? "active" : ""}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="products-grid">
            {filteredProducts.map((product) => (
              <article key={product.id} className="product-card">
                <div className="image-wrap">
                  <img src={product.image} alt={product.name} className="product-image" />
                  <span className="product-pill">{product.promo ? "Promoção" : product.badge}</span>
                </div>

                <div className="product-body">
                  <p className="section-label">{product.category}</p>
                  <h3>{product.name}</h3>
                  <p className="muted">{product.description}</p>

                  <div className="price-row">
                    <p className="price">{currency(product.price)}</p>
                    {product.promo && product.oldPrice ? (
                      <p className="old-price">{currency(product.oldPrice)}</p>
                    ) : null}
                  </div>

                  <div>
                    <p className="muted">Tamanho</p>
                    <div className="size-row">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() =>
                            setSelectedSizes((current) => ({
                              ...current,
                              [product.id]: size,
                            }))
                          }
                          className={`size-btn ${
                            selectedSizes[product.id] === size ? "active" : ""
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="product-actions">
                    <button onClick={() => addToCart(product)} className="btn btn-primary">
                      Adicionar ao carrinho
                    </button>
                    <a
                      href={`https://wa.me/5527996992922?text=${encodeURIComponent(
                        `Olá! Tenho interesse em: ${product.name} | Tamanho: ${
                          selectedSizes[product.id] || product.sizes[0]
                        }`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                    >
                      Comprar agora
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="carrinho" className="cart-grid">
          <div className="panel">
            <div className="row space">
              <div>
                <p className="section-label">Carrinho</p>
                <h2>Seu pedido</h2>
              </div>
              <span className="counter">{totalItems} item(ns)</span>
            </div>

            <div className="list">
              {cart.length === 0 ? (
                <div className="empty">
                  Seu carrinho está vazio. Adicione produtos para começar seu pedido.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="cart-item">
                    <img src={item.image} alt={item.name} className="thumb-lg" />
                    <div className="grow">
                      <h3>{item.name}</h3>
                      <p className="muted">Tamanho: {item.size}</p>
                      <p>{currency(item.price)}</p>
                    </div>
                    <div className="qty">
                      <button onClick={() => updateQuantity(item.id, item.size, -1)} className="qty-btn">-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.size, 1)} className="qty-btn">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <aside className="panel">
            <p className="section-label">Resumo</p>
            <h2>Finalizar compra</h2>

            <div className="summary">
              <div className="row space muted"><span>Itens</span><span>{totalItems}</span></div>
              <div className="row space muted"><span>Subtotal</span><span>{currency(totalPrice)}</span></div>
              <div className="row space total"><span>Total</span><span>{currency(totalPrice)}</span></div>
            </div>

            <a href={checkoutLink} target="_blank" rel="noreferrer" className="btn btn-primary full">
              Finalizar pedido no WhatsApp
            </a>

            <div className="info-box">
              O cliente monta o carrinho no site e envia o pedido pronto para o WhatsApp da loja.
            </div>

            <div className="contact-list">
              <p>Loja física: Rua Santos Dumont, Bairro Domiciano, Pinheiros - ES</p>
              <p>Instagram: @kfmul.timarcas</p>
              <p>WhatsApp: (27) 99699-2922</p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
