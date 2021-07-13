const headerCityButton = document.querySelector('.header__city-button')
const cartListGoods = document.querySelector('.cart__list-goods')
const cartTotalCost = document.querySelector('.cart__total-cost')
const subheaderCart = document.querySelector('.subheader__cart')
const cartOverlay = document.querySelector('.cart-overlay')
const cartBtnClose = document.querySelector('.cart__btn-close')
let hash = location.hash.substring(1)

headerCityButton.textContent =
  localStorage.getItem('lamoda-location') || 'ваш город?'

headerCityButton.addEventListener('click', () => {
  let city = prompt('укажите ваш город')
  if (city === null) {
    city = 'ваш город?'
  }
  headerCityButton.textContent = city
  localStorage.setItem('lamoda-location', city)
})

const getCartData = () => JSON?.parse(localStorage.getItem('lamodaCart')) || []
const setCartData = (data) => localStorage.setItem('lamodaCart', JSON.stringify(data))

let countCartItems = getCartData().length 
subheaderCart.textContent = `в корзине ${countCartItems} тов. `

const incrCountCartItems = () => {
  countCartItems++
  subheaderCart.textContent = `в корзине ${countCartItems} тов. `
}

const decrCountCartItems = () => {
  countCartItems--
  subheaderCart.textContent = `в корзине ${countCartItems} тов. `
}


const deleteCartItem = id => {   
  const newCartItems = getCartData().filter(item => item.id !== id)  
  setCartData(newCartItems)
  decrCountCartItems()
}

const renderCart = () => {
  cartListGoods.textContent = ''
  let totalCost = 0  
  const cartItems = getCartData()
  cartItems.forEach((item, index) => {    
    const tr = document.createElement('tr')
    tr.innerHTML = `   
      <td>${++index}</td>
      <td>${item.brand} ${item.name}</td>
      ${item.color ? `<td>${item.color}</td>` : `<td>-</td>`}
      ${item.size ? `<td>${item.size}</td>` : `<td>-</td>`}    
      <td>${item.cost} &#8381;</td>
      <td><button class="btn-delete" data-id="${item.id}">&times;</button></td>    
    `
    cartListGoods.append(tr)
    totalCost += item.cost
  })
  cartTotalCost.textContent = totalCost + ' ₽'
}

cartListGoods.addEventListener('click', event => {
  console.log('event.target.data-id', event.target)
  if(event.target.matches('.btn-delete')) deleteCartItem(event.target.dataset.id)
  renderCart()
})

//disable scroll

const disableScroll = () => {
  if (document.disableScroll) return
  const scrollWidth = window.innerWidth - document.body.offsetWidth
  document.disableScroll = true
  document.body.dbScrollY = window.scrollY
  document.body.style.cssText = `
    position: fixed;
    top: ${-window.scrollY}px;
    left: 0;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    padding-right: ${scrollWidth}px;
  `
}

const enableScroll = () => {
  document.disableScroll = false
  document.body.style.cssText = ''
  window.scroll({
    top: document.body.dbScrollY,
  })
}

// modal window



function openModal() {
  cartOverlay.classList.add('cart-overlay-open')
  disableScroll()
  renderCart()
}

function closeModal() {
  cartOverlay.classList.remove('cart-overlay-open')
  enableScroll()
}

subheaderCart.addEventListener('click', openModal)

cartBtnClose.addEventListener('click', closeModal)

cartOverlay.addEventListener('click', (event) => {
  if (event.target.matches('.cart-overlay')) closeModal()
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal()
})

// get data

const navigationList = document.querySelector('.navigation__list')
const goodsTitle = document.querySelector('.goods__title')

const getData = async () => {
  const data = await fetch('db.json')
  if (data.ok) {
    return data.json()
  } else {
    throw new Error(
      `no data recieved, error: ${data.status} ${data.statusText}`
    )
  }
}

const getGoods = (callback, prop, value) => {
  getData()
    .then((data) => {
      if (value) {
        callback(data.filter((item) => item[prop] === value))
      } else {
        callback(data)
      }
    })
    .catch((err) => console.error(err))
}

try {
  const goodsList = document.querySelector('.goods__list')
  if (!goodsList) throw 'This is not a page of goods'

  const createCard = ({ id, preview, cost, brand, name, sizes }) => {
    const card = document.createElement('li')
    card.classList.add('goods__item')
    card.innerHTML = `
      <article class="good">
        <a class="good__link-img" href="card-good.html#${id}">
            <img class="good__img" src="goods-image/${preview}" alt="">
        </a>
        <div class="good__description">
            <p class="good__price">${cost} &#8381;</p>
            <h3 class="good__title">${brand} <span class="good__title__grey">/ ${name}</span></h3>
            <p class="good__sizes">Размеры (RUS): <span class="good__sizes-list">${
              sizes ? sizes.join(' ') : ''
            }</span></p>
            <a class="good__link" href="card-good.html#${id}">Подробнее</a>
        </div>
      </article>
    `
    return card
  }

  const renderGoodsList = (data) => {
    goodsList.textContent = ''
    data.map((item) => {
      const card = createCard(item)
      goodsList.append(card)
    })
  }

  getGoods(renderGoodsList, 'category', hash)

  window.addEventListener('hashchange', () => {
    hash = location.hash.substring(1)
    getGoods(renderGoodsList, 'category', hash)
  })

  navigationList.addEventListener('click', (event) => {
    goodsTitle.textContent = event.target.textContent
  })
} catch (err) {
  console.warn(err)
}

// page of good

try {
  if (!document.querySelector('.card-good')) throw 'This is not a page of good'

  const cardGoodImage = document.querySelector('.card-good__image')
  const cardGoodBrand = document.querySelector('.card-good__brand')
  const cardGoodTitle = document.querySelector('.card-good__title')
  const cardGoodPrice = document.querySelector('.card-good__price')
  const cardGoodSelectWrappers = document.querySelectorAll('.card-good__select__wrapper')
  const cardGoodColor = document.querySelector('.card-good__color')
  const cardGoodColorList = document.querySelector('.card-good__color-list')
  const cardGoodSizes = document.querySelector('.card-good__sizes')
  const cardGoodSizesList = document.querySelector('.card-good__sizes-list')
  const cardGoodBuy = document.querySelector('.card-good__buy')     

  const generateList = (data) =>
    data.reduce( (html, item, index) =>
        html + `<li class="card-good__select-item" data-id="${index}">${item}</li>`, '' )

  const renderCardGood = ([{ photo, brand, name, id, color, sizes, cost }]) => {    
    const data = {brand, name, id, cost}
    cardGoodImage.src = `goods-image/${photo}`
    cardGoodImage.alt = `${brand}${name}`
    cardGoodBrand.textContent = brand
    cardGoodTitle.textContent = name
    cardGoodPrice.textContent = `${cost} ₽`
    if (color) {
      cardGoodColor.textContent = color[0]
      cardGoodColor.dataset.id = 0
      cardGoodColorList.innerHTML = generateList(color)
    } else {
      cardGoodColor.style.display = 'none'
    }
    if (sizes) {
      cardGoodSizes.textContent = sizes[0]
      cardGoodSizes.dataset.id = 0
      cardGoodSizesList.innerHTML = generateList(sizes)
    } else {
      cardGoodSizes.style.display = 'none'
    }
    if (getCartData().some(item => item.id === id)) {
      cardGoodBuy.classList.add('delete')
      cardGoodBuy.textContent = 'Удалить товар'
    }   

    cardGoodBuy.addEventListener('click', () => {
      if(cardGoodBuy.classList.contains('delete')) {
        deleteCartItem(id)     
        cardGoodBuy.classList.remove('delete')
        cardGoodBuy.textContent = 'Добавить товар'               
        return
      }
      if (color) data.color = cardGoodColor.textContent
      if (sizes) data.size = cardGoodSizes.textContent
      cardGoodBuy.classList.add('delete')
      cardGoodBuy.textContent = 'Удалить товар'
      const cartData = getCartData()
      cartData.push(data)
      setCartData(cartData) 
      incrCountCartItems()        
    })
  }

  getGoods(renderCardGood, 'id', hash)

  cardGoodSelectWrappers.forEach((item) => {
    item.addEventListener('click', (event) => {
      const target = event.target
      if (target.closest('.card-good__select')) {
        target.classList.toggle('card-good__select__open')
      }
      if (target.closest('.card-good__select-item')) {
        const cardGoodSelect = item.querySelector('.card-good__select')
        cardGoodSelect.textContent = target.textContent
        cardGoodSelect.dataset.id = target.dataset.id
        cardGoodSelect.classList.remove('card-good__select__open')
      }
    })
  })
} catch (err) {
  console.warn(err)
}
