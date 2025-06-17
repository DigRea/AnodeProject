$(function() {
    // Установка корректного URL при загрузке
    function ensureCorrectInitialUrl() {
        if (location.pathname === '/' || !location.pathname.includes('/pages/')) {
            history.replaceState(null, null, '/pages/index.html');
        }
    }
    ensureCorrectInitialUrl();

    // Показ/скрытие кнопки прокрутки
    $(window).scroll(function() {
        $('.scrollup').toggle($(this).scrollTop() > 0);
    });

    // Прокрутка наверх
    $('.scrollup').click(function() {
        $('body, html').animate({scrollTop: 0}, 400);
    });

    // Обработка меню - закрытие других разделов
    $('.section-title').click(function() {
        $('.section-content').not($(this).next()).slideUp(300);
        $(this).next('.section-content').slideToggle(300);
    });

    // Загрузка контента статей
    $('.article-link').click(function(e) {
        e.preventDefault();
        var articleUrl = $(this).attr('href');
        var $link = $(this);
        
        $.ajax({
            url: '/pages/' + articleUrl,
            type: 'HEAD',
            success: function() {
                $('#maincont').hide().load('/pages/' + articleUrl + ' #maincont > *', function(response, status) {
                    if (status === "error") {
                        showError('Ошибка загрузки статьи');
                    } else {
                        $(this).fadeIn(300);
                        updateActiveState($link, articleUrl);
                    }
                });
            },
            error: function() {
                showError('Статья не найдена');
            }
        });
    });

    // Обработка внутренних ссылок в статьях
    $(document).on('click', '#maincont a', function(e) {
        e.preventDefault();
        var targetUrl = $(this).attr('href');
        
        if (targetUrl.match(/page\d+\.html/)) {
            scrollToArticle(targetUrl);
        } else {
            window.location.href = targetUrl;
        }
    });

    // Обработка навигации по истории
    $(window).on('popstate', function() {
        var path = location.pathname;
        var page = path.split('/').pop();
        
        if (page === 'index.html' || path.endsWith('/pages/')) {
            resetContent();
        } 
        else if (page.match(/page\d+\.html/)) {
            loadArticle(page);
        }
    });

    // Автоматическая загрузка статьи при открытии страницы
    var initialPage = location.pathname.split('/').pop();
    if (initialPage.match(/page\d+\.html/)) {
        loadArticle(initialPage);
    }

    // Вспомогательные функции
    function showError(message) {
        $('#maincont').html('<p>' + message + '</p>').fadeIn(300);
        history.replaceState(null, null, '/pages/index.html');
        resetActiveState();
    }

    function updateActiveState($link, url) {
        history.pushState(null, null, '/pages/' + url);
        resetActiveState();
        $link.addClass('active-article')
             .closest('.menu-section')
             .find('.section-title')
             .addClass('active-section')
             .next('.section-content')
             .slideDown(300);
    }

    function resetActiveState() {
        $('.section-title').removeClass('active-section');
        $('.article-link').removeClass('active-article');
    }

    function resetContent() {
        $('#maincont').empty();
        resetActiveState();
    }

    function scrollToArticle(targetUrl) {
        if ($(window).scrollTop() > 0) {
            $('body, html').animate({scrollTop: 0}, 400, function() {
                $('.article-link[href="' + targetUrl + '"]').click();
            });
        } else {
            $('.article-link[href="' + targetUrl + '"]').click();
        }
    }

    function loadArticle(page) {
        $.ajax({
            url: '/pages/' + page,
            type: 'HEAD',
            success: function() {
                $('#maincont').load('/pages/' + page + ' #maincont > *', function() {
                    $('.article-link[href="' + page + '"]')
                        .addClass('active-article')
                        .closest('.menu-section')
                        .find('.section-title')
                        .addClass('active-section')
                        .next('.section-content')
                        .slideDown(300);
                });
            },
            error: function() {
                history.replaceState(null, null, '/pages/index.html');
            }
        });
    }
});
