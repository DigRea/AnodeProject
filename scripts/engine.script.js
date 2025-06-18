$(function() {
    // Установка корректного URL при загрузке
    function ensureCorrectInitialUrl() {
        if (location.pathname === '/' || !location.pathname.includes('/pages/')) {
            history.replaceState({}, null, '/pages/index.html');
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
        var $content = $(this).next('.section-content');
        var isOpening = !$content.is(':visible');

        $('.section-content').not($content).slideUp(300);
        $('.section-title').not(this).removeClass('active-section');

        if (isOpening) {
            $content.slideDown(300);
            $(this).addClass('active-section');
        } else {
            $(this).removeClass('active-section');
        }
    });

    // Загрузка контента статей
    $('.article-link').click(function(e) {
        e.preventDefault();
        var articleUrl = $(this).attr('href');

        if (location.pathname.endsWith(articleUrl)) {
            $('body, html').animate({scrollTop: 0}, 400);
            return;
        }

        loadArticleContent(articleUrl, $(this));
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
            $('#maincont').empty();
            resetActiveState();
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
        $('#maincont').html('<p>' + message + '</p>');
        history.replaceState({}, null, '/pages/index.html');
    }

    function loadArticleContent(url, $link) {
        // Сохраняем текущую высоту блока
        var currentHeight = $('#maincont').height();
        $('#maincont').css('min-height', currentHeight + 'px');

        $.get('/pages/' + url, function(data) {
            var $newContent = $(data).find('#maincont').html();

            // Плавная замена контента
            $('#maincont').html($newContent).css({
                'opacity': 0,
                'min-height': 'auto' // Сбрасываем min-height после загрузки
            }).animate({opacity: 1}, 300);

            history.pushState({}, null, '/pages/' + url);
            updateActiveState($link);
        }).fail(function() {
            showError('Статья не найдена');
            $('#maincont').css('min-height', 'auto');
        });
    }

    function updateActiveState($link) {
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
        // Сохраняем текущую высоту блока
        var currentHeight = $('#maincont').height();
        $('#maincont').css('min-height', currentHeight + 'px');

        $.get('/pages/' + page, function(data) {
            var $newContent = $(data).find('#maincont').html();

            $('#maincont').html($newContent).css({
                'opacity': 0,
                'min-height': 'auto'
            }).animate({opacity: 1}, 300);

            var $activeLink = $('.article-link[href="' + page + '"]');
            if ($activeLink.length) {
                updateActiveState($activeLink);
            }
        }).fail(function() {
            history.replaceState({}, null, '/pages/index.html');
            $('#maincont').empty().css('min-height', 'auto');
        });
    }
});
