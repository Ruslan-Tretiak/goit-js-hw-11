import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const elements = {
  form: document.querySelector('.js-search-form'),
  container: document.querySelector('.js-gallery'),
  btnLoad: document.querySelector('.js-load-more'),
  input: document.querySelector('.js-form-input'),
};
let currentPage = 1;
elements.form.addEventListener('submit', handlerSubmit);
elements.btnLoad.addEventListener('click', handlerLoadMore);
elements.btnLoad.classList.add('load-more-hidden');

const lightbox = new SimpleLightbox('.gallery a');

async function serviceSearch(searchInfo) {
  const BASE_URL = 'https://pixabay.com/api/';
  const params = new URLSearchParams({
    key: '39210626-76714a19412a01689ebadc3ae',
    q: searchInfo,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: currentPage,
    per_page: 40,
  });

  const responce = await axios.get(`${BASE_URL}?${params}`);
  return await responce.data;
}

async function handlerSubmit(event) {
  event.preventDefault();
  elements.container.innerHTML = '';
  elements.btnLoad.classList.replace('load-more', 'load-more-hidden');
  const searchInfo = elements.input.value.trim();
  if (searchInfo === '') {
    return;
  }
  try {
    const data = await serviceSearch(searchInfo);
    elements.container.insertAdjacentHTML('beforeend', createMarkup(data.hits));
    lightbox.refresh();
    if (data.hits.length) {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images`);
    } else {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      elements.container.innerHTML = '';
    }
    const totalPages = data.totalHits / data.hits.length;

    if (currentPage < totalPages) {
      elements.btnLoad.classList.replace('load-more-hidden', 'load-more');
    }
  } catch (err) {
    console.log(err);
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    elements.container.innerHTML = '';
  }
}

async function handlerLoadMore() {
  currentPage += 1;
  try {
    const data = await serviceSearch(elements.input.value);

    elements.container.insertAdjacentHTML('beforeend', createMarkup(data.hits));
    lightbox.refresh();
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });


    if (currentPage <= data.totalHits / data.hits.length) {
      elements.btnLoad.classList.replace('load-more', 'load-more-hidden');
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    }
  } catch (err) {
    console.log(err);
    elements.btnLoad.classList.replace('load-more', 'load-more-hidden');
  }
}

function createMarkup(data) {
  return data
    .map(
      ({
        tags,
        webformatURL,
        largeImageURL,
        views,
        downloads,
        likes,
        comments,
      }) => `<a class="info-link" href="${largeImageURL}">
        <div class="photo-card">
          <img class="image" src="${webformatURL}" alt="${tags}" loading="lazy" width="335" height="210" />
          <div class="info">
            <p class="info-item">
              <b>Likes</b>${likes}
            </p>
            <p class="info-item">
              <b>Views</b>${views}
            </p>
            <p class="info-item">
              <b>Comments</b>${comments}
            </p>
            <p class="info-item">
              <b>Downloads</b>${downloads}
            </p>
          </div>
        </div>
      </a>`
    )
    .join('');
}
