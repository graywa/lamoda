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
  const scrollWidth = window.innerWidth - document.body.offsetWidth
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

const getGoods = (callback, value) => {
  getData()
  .then( data =>{
    if(value) {
      callback( data.filter(item => item.category === value) )
    } else {
      callback(data)
    }    
  })
  .catch( err => console.error(err) )
}

getGoods( (data) => console.warn(data) )

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

  getGoods(renderGoodsList, hash) 

  window.addEventListener('hashchange', () => {
    hash = location.hash.substring(1)
    getGoods(renderGoodsList, hash)
  })

  navigationList.addEventListener('click', (event) => {
    goodsTitle.textContent = event.target.textContent
  })

} catch (err) {
  console.warn(err)
}
