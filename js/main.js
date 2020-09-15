var proxy = 'https://afternoon-bastion-51495.herokuapp.com/';
var baseUrl = 'https://cloud.feedly.com/v3';
//var url = 'https://cloud.feedly.com/v3/search/feeds?query=';
//var streamUrl = new URL('https://cloud.feedly.com/v3/streams/contents');

var searchBtn = document.querySelector('.js-btn-search');
var clearBtn = document.querySelector('.js-btn-clear');
var feedList = document.querySelector('.js-feeds');
var streamList = document.querySelector('.js-streams');
var loader = '<div class="loader"><img src="https://mir-s3-cdn-cf.behance.net/project_modules/disp/35771931234507.564a1d2403b3a.gif" style="width:10%;"><span>Loading...</span></div>';

searchBtn.addEventListener('click', function () {
    var query = document.querySelector('.js-search-box').value;
    while (feedList.lastElementChild) {
        feedList.removeChild(feedList.lastElementChild);
    }
    feedList.insertAdjacentHTML('beforeend', loader);


    getFeed(query).then(data => {
        var feeds = data.results;
        var html = '';
        for (feed of feeds) {
            //var feedURL = feed.feedId.replace('feed/', '');
            var imgUrl = 'https://via.placeholder.com/32';
            if (feed.iconUrl !== undefined) {
                //imgUrl = (article.visual.url == 'none') ? imgUrl : article.visual.url;
                imgUrl = feed.iconUrl;
            }

            html += '<li class="feed">'
                + '<img class="feed__img" src="' + imgUrl + '" />'
                + '<div class="feed__content">'
                + '<h4 class="feed__title"><a>' + feed.title + '</a></h4>'
                + '<button class="feed__btn js-feed-item" data-feed-id="' + feed.feedId + '">Preview</button>'
                + '</div>'
                + '</li>';
            //html += '<button class="btn btn--orange feed-item" data-feed-id="' + feed.feedId + '">' + feedname + '</button>'
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
    if (event.target.classList.contains('js-feed-item')) {
        var feed = event.target;
        var streamId = feed.dataset.feedId;
        var html = '';

        feedList.insertAdjacentHTML('beforeend', loader);

        getArticlesAsync(streamId)
            .then(articles => renderArticles(articles))
            .then(html => {
                while (streamList.lastElementChild) {
                    streamList.removeChild(streamList.lastElementChild);
                }

                feedList.removeChild(document.querySelector('.loader'));
                streamList.insertAdjacentHTML('beforeend', html);
            });

        // getStream(streamId)
        //     .then(async function (data) {
        //         let count = 0;
        //         let imglist = [];
        //         for (let article of data.items) {
        //             let imgUrl = 'https://via.placeholder.com/160';
        //             if (article.visual !== undefined) {
        //                 //imgUrl = (article.visual.url == 'none') ? imgUrl : article.visual.url;
        //                 // imgUrl = article.visual.url;
        //                 imgUrl = await checkImageExists(article.visual.url);
        //                 //console.log('count: ' + count + ' - await img: ' + imgUrl);
        //                 //imglist.push(imgUrl);
        //             }

        //             html += '<li class="post__horizontal">' +
        //                 '<div class="post__img">' +
        //                 '<a href="' + article.canonicalUrl + '">' +
        //                 '<img src="' + imgUrl + '"></a></div>' +
        //                 '<div class="post__content">' +
        //                 '<h4 class="post__title">' +
        //                 '<a href="' + article.canonicalUrl + '">' + article.title + '</a></h4>' +
        //                 //'<div>' + article.summary.content + '</div>' +
        //                 '</div>' +
        //                 '</li>';
        //         }

        //         // Promise.all(imglist).then(imglists => {
        //         //     //console.log(JSON.stringify(imglists));
        //         //     let count = 0;
        //         //     for(img of imglists){
        //         //         let image = new Image();
        //         //         image.src = img;
        //         //         streamList.appendChild(image);
        //         //         console.log(count+' - '+img);
        //         //         count++;
        //         //     }

        //         // })
        //         while (streamList.lastElementChild) {
        //             streamList.removeChild(streamList.lastElementChild);
        //         }

        //         feedList.removeChild(document.querySelector('.loader'));
        //         streamList.insertAdjacentHTML('beforeend', html);
        //     });
    }
});


async function getFeed(query) {
    var response = await fetch(proxy + baseUrl + `/search/feeds?query=${query}&count=20`, { method: 'GET' })
        .then(handleFetchErrors)
        .catch(error => {
            console.log(error);
        });
    var data = await response.json();

    return data;
}

async function getStream(streamId) {
    var streamUrl = new URL(baseUrl + '/streams/contents');
    var params = { streamId: streamId, count: 20 };
    Object.keys(params).forEach(key => streamUrl.searchParams.append(key, params[key]));

    var response = await fetch(proxy + streamUrl, { method: 'GET' })
        .then(handleFetchErrors)
        .catch(error => {
            console.log(error.message);
        });
    var data = await response.json();
    return data;
}

function handleFetchErrors(response) {
    if (response.status == 200) {
        //console.log(response.status);
        return response;
    }
    throw Error('Error is: ' + response.status);
}

async function checkImageExists(imgUrl) {
    let newimgUrl = fetch(proxy + imgUrl)
        .then(res => {
            if (res.status == 404) {
                imgUrl = 'https://via.placeholder.com/150';
                //console.log('img not found, default: ' + imgUrl);
                return imgUrl;
            }
            return imgUrl;
            //console.log('response stats:' + res.status);
        });
    return newimgUrl;
}


async function getArticlesAsync(streamId) {
    let streamUrl = new URL(baseUrl + '/streams/contents');
    let params = { streamId: streamId, count: 20 };
    Object.keys(params).forEach(key => streamUrl.searchParams.append(key, params[key]));
    let articles = [];

    // fetch data from api
    await fetch(proxy + streamUrl, { method: 'GET' })
        .then(handleFetchErrors)
        .then(async function (res) {
            let data = await res.json();
            //console.log(data);

            for (let item of data.items) {
                let imgUrl = 'https://via.placeholder.com/160'; //if there is no image then use the default image

                if (item.visual !== undefined) {
                    // check if the image is exists on the server or not
                    imgUrl = await checkImageExists(item.visual.url);
                }

                let article = { 'article': item, 'img': imgUrl };

                //console.log('article: ' + article);
                articles.push(article);
            }
        })
        .catch(error => {
            console.log(error.message);
        });
    console.log(articles);
    return articles;
}

async function renderArticles(articles) {
    let html = '';
    for (let item of articles) {
        html += '<li class="post__horizontal" data-id="' + item.article.id + '">' +
            '<div class="post__img">' +
            //'<a href="' + item.article.canonicalUrl + '">' +
            '<a href="' + item.article.alternate[0].href + '" target="_blank">' +
            '<img src="' + item.img + '"></a></div>' +
            '<div class="post__content">' +
            '<h4 class="post__title">' +
            //'<a href="' + item.article.canonicalUrl + '">' + item.article.title + '</a></h4>' +
            '<a href="' + item.article.alternate[0].href + '" target="_blank">' + item.article.title + '</a></h4>' +
            //'<div>' + article.summary.content + '</div>' +
            '</div>' +
            '</li>';
    }
    return html;
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.js-btn-search').click();
});