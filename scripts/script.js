const headerCityButton = document.querySelector('.header__city-button')
let hash = location.hash.substring(1)

headerCityButton.textContent = localStorage.getItem('lamoda-location') || 'ваш город?'

headerCityButton.addEventListener('click', () => {
  let city = prompt('укажите ваш город') 
  if(city === null) {
    city = 'ваш город?'    
  }
  headerCityButton.textContent = city
  localStorage.setItem('lamoda-location', city)
})

//disable scroll

const disableScroll = () => {  
  if(document.disableScroll) return
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
    top: document.body.dbScrollY
  })
}

// modal window

const subheaderCart = document.querySelector('.subheader__cart')
const cartOverlay = document.querySelector('.cart-overlay')
const cartBtnClose = document.querySelector('.cart__btn-close')

function openModal() {
  cartOverlay.classList.add('cart-overlay-open')
  disableScroll()
}

function closeModal() {
  cartOverlay.classList.remove('cart-overlay-open')
  enableScroll()
}

subheaderCart.addEventListener('click', openModal)

cartBtnClose.addEventListener('click', closeModal)

cartOverlay.addEventListener('click', event => {
  if( event.target.matches('.cart-overlay') ) closeModal()
} )

document.addEventListener('keydown', event => {
 if(event.key === 'Escape') closeModal()
} )

// get data

const navigationList = document.querySelector('.navigation__list')
const goodsTitle = document.querySelector('.goods__title')

const getData = async () => {
  const data = await fetch('db.json')
  if(data.ok) {
    return data.json()
  } else {
    throw new Error(`no data recieved, error: ${data.status} ${data.statusText}`)
  }  
}

const getGoods = (callback, prop, value) => {
  getData()
  .then( data =>{
    if(value) {
      callback( data.filter(item => item[prop] === value) )
    } else {
      callback(data)
    }    
  })
  .catch( err => console.error(err) )
}

try {
  const goodsList = document.querySelector('.goods__list')
  if(!goodsList) throw 'This is not a page of goods'

  const createCard = ({id, preview, cost, brand, name, sizes}) => {
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
            <p class="good__sizes">Размеры (RUS): <span class="good__sizes-list">${sizes ? sizes.join(' ') : ''}</span></p>
            <a class="good__link" href="card-good.html#${id}">Подробнее</a>
        </div>
      </article>
    `
    return card
  }

  const renderGoodsList = data => {
    goodsList.textContent = ''
    data.map(item => {
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
if(!document.querySelector('.card-good')) throw 'This is not a page of good'

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

const generateList = data =>  
  data.reduce( (html, item, index) => 
    html + `<li class="card-good__select-item" data-id="${index}">${item}</li>`, '')

const renderCardGood = ([{photo, brand, name, color, sizes, cost}]) => {
  cardGoodImage.src = `goods-image/${photo}`
  cardGoodImage.alt = `${brand}${name}`
  cardGoodBrand.textContent = brand
  cardGoodTitle.textContent = name
  cardGoodPrice.textContent = `${cost} ₽`  
  if(color) {
     cardGoodColor.textContent = color[0]
     cardGoodColor.dataset.id = 0
     cardGoodColorList.innerHTML = generateList(color)
  } else {
    cardGoodColor.style.display = 'none'
  }
  if(sizes) {
    cardGoodSizes.textContent = sizes[0]
    cardGoodSizes.dataset.id = 0
    cardGoodSizesList.innerHTML = generateList(sizes)
 } else {
   cardGoodSizes.style.display = 'none'
 } 
}

getGoods(renderCardGood, 'id', hash)

cardGoodSelectWrappers.forEach(item => {
  item.addEventListener('click', event => {
    const target = event.target
    if(target.closest('.card-good__select')) {      
      target.classList.toggle('card-good__select__open')
    }
    if(target.closest('.card-good__select-item')) {
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
