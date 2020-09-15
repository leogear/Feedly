var proxy = 'https://afternoon-bastion-51495.herokuapp.com/';
//var url = 'https://cloud.feedly.com/v3/search/feeds?query=';
//var streamUrl = new URL('https://cloud.feedly.com/v3/streams/contents');

var searchBtn = document.querySelector('.js-btn-search');
var clearBtn = document.querySelector('.js-btn-clear');
var feedList = document.querySelector('.js-feeds');
var streamList = document.querySelector('.js-streams');
var loader = '<div class="loader"><img src="https://mir-s3-cdn-cf.behance.net/project_modules/disp/35771931234507.564a1d2403b3a.gif" style="width:10%;"><span>Loading...</span></div>';

searchBtn.addEventListener('click', function () {
    var query = document.querySelector('.js-search-box').value;

    feedList.insertAdjacentHTML('beforeend', loader);

    getFeed(query).then(data => {
        var feeds = data.results;
        var html = '';
        for (feed of feeds) {
            var feedname = feed.feedId.replace('feed/', '');
            html += '<button class="btn btn--orange feed-item" data-feed-id="' + feed.feedId + '">' + feedname + '</button>'
        }
        feedList.insertAdjacentHTML('beforeend', html);
        feedList.removeChild(document.querySelector('.loader'));
    });
});

clearBtn.addEventListener('click', function () {
    while (feedList.lastElementChild) {
        feedList.removeChild(feedList.lastElementChild);
    }
    while (streamList.lastElementChild) {
        streamList.removeChild(streamList.lastElementChild);
    }
});

feedList.addEventListener('click', function (event) {
    // fetch post by feed
    if (event.target.classList.contains('feed-item')) {
        var feed = event.target;
        var streamId = feed.dataset.feedId;
        var html = '';
        feedList.insertAdjacentHTML('beforeend', loader);
        
        getStream(streamId).then(data => {
            var articles = data.items;
            for (article of articles) {
                var imgUrl = 'https://via.placeholder.com/150';
                if (article.visual !== undefined) {
                    //imgUrl = (article.visual.url == 'none') ? imgUrl : article.visual.url;
                    imgUrl = article.visual.url;
                }
                html += '<li class="post__horizontal">' +
                    '<div class="post__img">' +
                    '<a href="' + article.canonicalUrl + '">' +
                    '<img src="' + imgUrl + '"></a></div>' +
                    '<div class="post__content">' +
                    '<h4 class="post__title">' +
                    '<a href="' + article.canonicalUrl + '">' + article.title + '</a></h4>' +
                    '</div>' +
                    '</li>';
            }

            while (streamList.lastElementChild) {
                streamList.removeChild(streamList.lastElementChild);
            }
            streamList.insertAdjacentHTML('beforeend', html);
            feedList.removeChild(document.querySelector('.loader'));
        });
    }
});


async function getFeed(query) {
    let response = await fetch(proxy + `https://cloud.feedly.com/v3/search/feeds?query=${query}`, { method: 'GET' });
    let data = await response.json();
    return data;
}

async function getStream(streamId) {
    var streamUrl = new URL('https://cloud.feedly.com/v3/streams/contents');
    var params = { streamId: streamId, count: 20 };
    Object.keys(params).forEach(key => streamUrl.searchParams.append(key, params[key]));

    let response = await fetch(proxy + streamUrl, { method: 'GET' });
    let data = await response.json();
    return data;
}