const sortBySelect = document.getElementById("sortBy");
const moviesGridEl = document.getElementById("moviesGrid");
const genresButtonEls = document.querySelectorAll(".genres__button");

const loadMoreBtn = document.getElementById("loadMore");
const searchBtnEl = document.getElementById("searchBtn");
const searchBtnAppearedEl = document.getElementById("searchBtnAppeared");

let keywordSuggestionsData = [];
const keywordsSearchInput = document.getElementById("keywordsSearch");
const keywordSuggestionsListEl = document.getElementById("keywordSuggestions");

const languageSelectionSelect = document.getElementById("languageSelection");
const releaseDateFromInputEl = document.getElementById(
  "releaseDate__fromInput"
);
const releaseDateToInputEl = document.getElementById("releaseDate__toInput");
const spinnerEl = document.getElementById("spinner");

const userVotesRangeEl = document.getElementById("userVotesRange");
const userVotesFillEl = document.getElementById("userVotesFill");

let stateOfPage = {
  currentPage: 1,
  totalPages: 1,
  sortBy: "popularity.desc",
  language: "en-US",
  originalLanguage: "",
  filters: {
    releaseDateFrom: "",
    releaseDateTo: "",
    with_genres: [],
    vote_average_min: 0,
    vote_average_max: 10,
    runtime_min: 0,
    runtime_max: 360,
    vote_count_min: 0,
    with_keywords: [],
  },
};

const defaultMoviesUrl = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${stateOfPage.currentPage}`;
const defaultMoviesOptions = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2ODdkNDllYTYwNmQ0Mzk5MzM4YTRiYWQ0ZmUwNGVkOSIsIm5iZiI6MTc2NTk3MDc4Ni45NDU5OTk5LCJzdWIiOiI2OTQyOTM2MjI0MGZhODc3NjdkNzM5MjEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.pd94LOlkVSTrqd_TuTJzsk9B5qGVQ67duwCtovA0Tks",
  },
};

document.addEventListener("DOMContentLoaded", async () => {
  const initialMovies = await fetchingDefaultPopularMovies(
    defaultMoviesUrl,
    defaultMoviesOptions
  );
  appendMoviesToGrid(initialMovies.results);
});

document.addEventListener("DOMContentLoaded", () => {
  const minRangeInputEl = document.getElementById("minRange");
  const maxRangeInputEl = document.getElementById("maxRange");
  const rangeFillEl = document.getElementById("rangeFill");

  const minRuntimeEl = document.getElementById("minRuntime");
  const maxRuntimeEl = document.getElementById("maxRuntime");
  const rangeFillRuntimeEl = document.getElementById("rangeFillRuntime");
  if (minRangeInputEl && maxRangeInputEl && rangeFillEl) {
    const updateRangeFill = () => {
      const minValue = minRangeInputEl.value;
      const maxValue = maxRangeInputEl.value;
      const minPercent = (minValue / 10) * 100;
      const maxPercent = (maxValue / 10) * 100;

      rangeFillEl.style.left = minPercent + "%";
      rangeFillEl.style.width = maxPercent - minPercent + "%";
      stateOfPage.filters.vote_average_min = minValue;
      stateOfPage.filters.vote_average_max = maxValue;
      stateOfPage.currentPage = 1;
    };

    minRangeInputEl.addEventListener("input", () => {
      if (minRangeInputEl.value > maxRangeInputEl.value) {
        minRangeInputEl.value = maxRangeInputEl.value;
      }
      updateRangeFill();
    });

    maxRangeInputEl.addEventListener("input", () => {
      if (maxRangeInputEl.value < minRangeInputEl.value) {
        maxRangeInputEl.value = minRangeInputEl.value;
      }
      updateRangeFill();
    });
    updateRangeFill();
  }

  if (minRuntimeEl && maxRuntimeEl && rangeFillRuntimeEl) {
    const updateRuntimeFill = () => {
      const minVal = Number(minRuntimeEl.value);
      const maxVal = Number(maxRuntimeEl.value);
      const minPct = (minVal / 300) * 100;
      const maxPct = (maxVal / 300) * 100;
      rangeFillRuntimeEl.style.left = minPct + "%";
      rangeFillRuntimeEl.style.width = maxPct - minPct + "%";

      stateOfPage.filters.runtime_min = minVal;
      stateOfPage.filters.runtime_max = maxVal;
      stateOfPage.currentPage = 1;
    };

    minRuntimeEl.addEventListener("input", () => {
      if (minRuntimeEl.value > maxRuntimeEl.value)
        minRuntimeEl.value = maxRuntimeEl.value;
      updateRuntimeFill();
    });
    maxRuntimeEl.addEventListener("input", () => {
      if (maxRuntimeEl.value < minRuntimeEl.value)
        maxRuntimeEl.value = minRuntimeEl.value;
      updateRuntimeFill();
    });

    updateRuntimeFill();
  }
});

const toggleFilterCard = (currentDiv) => {
  const nextDiv = currentDiv.nextElementSibling;
  const openedDropdown = currentDiv.querySelector(".openedDropdown");
  const closedDropdown = currentDiv.querySelector(".closedDropdown");

  if (nextDiv.style.display === "none" || nextDiv.style.display === "") {
    nextDiv.style.display = "block";
    openedDropdown.style.display = "flex";
    closedDropdown.style.display = "none";
  } else {
    nextDiv.style.display = "none";
    openedDropdown.style.display = "none";
    closedDropdown.style.display = "flex";
  }
};

const buildUrl = () => {
  let baseUrl = "https://api.themoviedb.org/3/discover/movie";

  // Main Build URL in case of different params
  // encodeURI()
  let params = new URLSearchParams({
    language: "en-US",
    include_adult: "false",
    include_video: "false",
    page: stateOfPage.currentPage,
    sort_by: stateOfPage.sortBy,
  });
  if (stateOfPage.filters.releaseDateFrom) {
    params.append(
      "primary_release_date.gte",
      stateOfPage.filters.releaseDateFrom
    );
  }
  if (stateOfPage.filters.releaseDateTo) {
    params.append(
      "primary_release_date.lte",
      stateOfPage.filters.releaseDateTo
    );
  }
  if (stateOfPage.filters.with_genres.length > 0) {
    params.append("with_genres", stateOfPage.filters.with_genres.join("|"));
  }
  if (stateOfPage.originalLanguage) {
    params.append("with_original_language", stateOfPage.originalLanguage);
  }
  if (stateOfPage.filters.vote_count_min) {
    params.append("vote_count.gte", stateOfPage.filters.vote_count_min);
  }
  // Joined with | because url(request) gonna build by that
  if (stateOfPage.filters.with_keywords.length > 0) {
    params.append("with_keywords", stateOfPage.filters.with_keywords.join("|"));
  }
  if (stateOfPage.filters.vote_average_min > 0) {
    params.append("vote_average.gte", stateOfPage.filters.vote_average_min);
  }
  if (stateOfPage.filters.vote_average_max < 10) {
    params.append("vote_average.lte", stateOfPage.filters.vote_average_max);
  }
  if (stateOfPage.filters.runtime_min > 0) {
    params.append("with_runtime.gte", stateOfPage.filters.runtime_min);
  }
  if (stateOfPage.filters.runtime_max < 300) {
    params.append("with_runtime.lte", stateOfPage.filters.runtime_max);
  }

  return `${baseUrl}?${params.toString()}`;
};

const updateUserVotesFill = (value) => {
  const percent = (value / 500) * 100;
  userVotesFillEl.style.width = percent + "%";
};

const loadMoreMovies = async () => {
  stateOfPage.currentPage++;
  let url = buildUrl();
  const initialMovies = await fetchMoviesByParams(url, defaultMoviesOptions);
  appendMoviesToGrid(initialMovies.results);
};

const hideLoadMore = () => {
  if (stateOfPage.currentPage >= stateOfPage.totalPages) {
    loadMoreBtn.style.display = "none";
  }
};

const fetchAndRenderMovies = async () => {
  const url = buildUrl();
  console.log(url);
  // Initial fetch and appending to page
  const response = await fetchMoviesByParams(url, defaultMoviesOptions);
  stateOfPage.totalPages = response.total_pages;
  moviesGridEl.innerHTML = "";
  appendMoviesToGrid(response.results);
  hideLoadMore();
};

const fetchingDefaultPopularMovies = async (url, options) => {
  // Default Movies fetching is seperated from (sorted,filtered)
  try {
    const request = await fetch(url, options);
    const response = await request.json();
    return response;
  } catch (err) {
    showError("Failed To Load Movies!");
    console.error(err);
  }
};

const fetchMoviesByParams = async (url, options) => {
  // Initial fetch by different url's
  try {
    const request = await fetch(url, options);
    const response = await request.json();
    console.log(response);
    stateOfPage.totalPages = response.total_pages;
    return response;
  } catch (err) {
    showError("Failed To Load Movies!");
    console.error(err);
  }
};

const fetchKeywordsSuggestions = async (keywords) => {
  // fetch the keywords list by user type
  try {
    const url = `https://api.themoviedb.org/3/search/keyword?query=${encodeURIComponent(
      keywords
    )}`;

    const request = await fetch(url, defaultMoviesOptions);
    const response = await request.json();
    keywordSuggestionsData = response.results;
    // Think about reseting value of array
    displaySuggestions(keywordSuggestionsData);
  } catch (err) {
    console.error("Fetch failed!");
    showErrorOfKeywords();
  }
};

const getGradient = (rating) => {
  const angle = (rating / 10) * 360;
  const hue = (rating / 10) * 120;
  const fillColor = `hsl(${hue},70%, 45%)`;
  const emptyColor = `#E0E0E0`;
  return `conic-gradient(${fillColor} 0deg ${angle}deg, ${emptyColor} ${angle}deg 360deg)`;
};

const createDesktopMovieCard = (movie) => {
  const card = document.createElement("div");
  card.className = "movie__card";

  const rating = Math.round(movie.vote_average * 10) / 10;
  const ratingPercent = Math.round(rating * 10);

  const image = movie.poster_path
    ? `https://media.themoviedb.org/t/p/w500${movie.poster_path}`
    : "./assets/image.png";
  card.innerHTML = `<div class="movie__card__img">
 <img
 src=${image}
 alt="movieCard"
 id="movieCard__img"
 />
 <div class="rating-circle" style="background: ${getGradient(rating)};">
 <div class="rating-circle__inner">
 <div class="rating-circle__text">${ratingPercent}</div>
 <div class="rating-circle__percent">%</div>
 </div>
 </div>
 <svg
 class="threeDots"
 width="24"
 height="24"
 viewBox="0 0 24 24"
 fill="currentColor"
 xmlns="http://www.w3.org/2000/svg"
 >
 <circle cx="6" cy="12" r="2" />
 <circle cx="12" cy="12" r="2" />
 <circle cx="18" cy="12" r="2" />
 </svg>
 </div>
 <div class="movie__card__description">
 <h3 id="movieCard__Title">${movie.title}</h3>
 <p id="movieCard__Date">${movie.release_date}</p>
 </div>
 `;
  return card;
};

const createMovieCard = (movie) => {
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    return createMobileMovieCard(movie);
  } else {
    return createDesktopMovieCard(movie);
  }
};

const appendMoviesToGrid = (movies) => {
  // Adding movies lists to main content
  movies.forEach((movie) => {
    const result = createMovieCard(movie);
    moviesGridEl.appendChild(result);
  });
};

const createMobileMovieCard = (movie) => {
  const card = document.createElement("div");
  card.className = "movie-card";

  const image = movie.poster_path
    ? `https://media.themoviedb.org/t/p/w500${movie.poster_path}`
    : "./assets/image.png";

  const overview = movie.overview || "No description available.";

  card.innerHTML = `<img class="movie-card__poster" src="${image}" alt="${
    movie.title
  }" height="150px" />
 <div class="movie-card__content">
 <h3 class="movie-card__title">${movie.title}</h3>
 <p class="movie-card__date">${movie.release_date}</p>
 <p class="movie-card__overview">
 ${overview.substring(0, 120)}${overview.length > 120 ? "..." : ""}
 </p>
 </div>`;
  return card;
};

genresButtonEls.forEach((button) => {
  // Get the Values of Genre Buttons
  button.addEventListener("click", (e) => {
    e.preventDefault();

    const genreId = button.id.split("-")[1];
    const isSelected = stateOfPage.filters.with_genres.includes(genreId);

    if (isSelected) {
      stateOfPage.filters.with_genres = stateOfPage.filters.with_genres.filter(
        (n) => n !== genreId
      );
      button.style.color = "var(--black-color)";
      button.style.backgroundColor = "var(--main-color)";
    } else {
      stateOfPage.filters.with_genres.push(genreId);
      button.style.color = "var(--main-color)";
      button.style.backgroundColor = "var(--main-light-blue)";
    }

    const anyActive = stateOfPage.filters.with_genres.length > 0;
    if (anyActive) {
      searchBtnEl.style.backgroundColor = "var(--main-light-blue)";
      searchBtnEl.style.color = "var(--main-color)";
      searchBtnAppearedEl.style.backgroundColor = "var(--main-light-blue)";
      searchBtnAppearedEl.style.color = "var(--main-color)";
    } else {
      searchBtnEl.style.backgroundColor = "var(--bg-dropdown)";
      searchBtnEl.style.color = "var(--gray-color)";
      searchBtnAppearedEl.style.backgroundColor = "var(--bg-dropdown)";
      searchBtnAppearedEl.style.color = "var(--gray-color)";
    }
  });
});

sortBySelect.addEventListener("change", async (e) => {
  stateOfPage.sortBy = e.target.value;
  searchBtnEl.style.backgroundColor = "var(--main-light-blue)";
  searchBtnEl.style.color = "var(--main-color)";
  searchBtnAppearedEl.style.backgroundColor = "var(--main-light-blue)";
  searchBtnAppearedEl.style.color = "var(--main-color)";
});

loadMoreBtn.addEventListener("click", async () => {
  await loadMoreMovies();
});

searchBtnEl.addEventListener("click", async () => {
  await fetchAndRenderMovies(stateOfPage.sortBy);
});

searchBtnAppearedEl.addEventListener("click", async () => {
  await fetchAndRenderMovies(stateOfPage.sortBy);
});

keywordsSearchInput.addEventListener("input", async (e) => {
  const searchValue = e.target.value.trim();
  await fetchKeywordsSuggestions(searchValue);
});

userVotesRangeEl.addEventListener("input", (e) => {
  const value = Number(e.target.value);

  stateOfPage.filters.vote_count_min = value;
  updateUserVotesFill(value);
  searchBtnEl.style.backgroundColor = "var(--main-light-blue)";
  searchBtnEl.style.color = "var(--main-color)";
  searchBtnAppearedEl.style.backgroundColor = "var(--main-light-blue)";
  searchBtnAppearedEl.style.color = "var(--main-color)";
});

const showErrorOfKeywords = () => {
  document.getElementById("keywordSuggestions").innerHTML = `
 <div class="error-msg">
 <p>Couldn't Load Suggestions</p>
 </div>
 `;
};

const displaySuggestions = (suggestions) => {
  keywordSuggestionsListEl.innerHTML = "";

  suggestions.forEach((elem) => {
    const li = document.createElement("li");

    li.className = "keyword__suggestions--list";
    li.textContent = elem.name;
    li.style.display = "grid";
    li.addEventListener("click", () => {
      if (!stateOfPage.filters.with_keywords.includes(elem.id)) {
        stateOfPage.filters.with_keywords.push(elem.id);
      }

      keywordsSearchInput.value = elem.name;
      searchBtnEl.style.backgroundColor = "var(--main-light-blue)";
      searchBtnEl.style.color = "var(--main-color)";
      keywordSuggestionsListEl.style.display = "none";
    });

    keywordSuggestionsListEl.appendChild(li);
    keywordSuggestionsListEl.style.display = "grid";
  });
};

releaseDateFromInputEl.addEventListener("change", () => {
  stateOfPage.filters.releaseDateFrom = releaseDateFromInputEl.value;
  searchBtnEl.style.backgroundColor = "var(--main-light-blue)";
  searchBtnEl.style.color = "var(--main-color)";
  searchBtnAppearedEl.style.backgroundColor = "var(--main-light-blue)";
  searchBtnAppearedEl.style.color = "var(--main-color)";
});

releaseDateToInputEl.addEventListener("change", () => {
  stateOfPage.filters.releaseDateTo = releaseDateToInputEl.value;
  searchBtnEl.style.backgroundColor = "var(--main-light-blue)";
  searchBtnEl.style.color = "var(--main-color)";
  searchBtnAppearedEl.style.backgroundColor = "var(--main-light-blue)";
  searchBtnAppearedEl.style.color = "var(--main-color)";
});

languageSelectionSelect.addEventListener("change", async () => {
  stateOfPage.originalLanguage = languageSelectionSelect.value;
  stateOfPage.currentPage = 1;

  searchBtnEl.style.backgroundColor = "var(--main-light-blue)";
  searchBtnEl.style.color = "var(--main-color)";
  searchBtnAppearedEl.style.backgroundColor = "var(--main-light-blue)";
  searchBtnAppearedEl.style.color = "var(--main-color)";
});

const showError = (msg = "Please Try Again Later!") => {
  document.getElementById("moviesPanel").innerHTML = `
 <div class="error-msg">
 <p>${msg}</p>
 </div>
 `;
  loadMore.style.display = "none";
};

window.addEventListener("scroll", () => {
  const mainBtnRect = searchBtnEl.getBoundingClientRect();
  mainBtnRect.bottom < 0
    ? (searchBtnAppearedEl.style.display = "block")
    : (searchBtnAppearedEl.style.display = "none");
});
