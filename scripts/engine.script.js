$(function() {
    // Константы путей
    const BASE_PATH = '/';
    const PAGES_DIR = 'pages/';
    const FULL_PAGES_PATH = BASE_PATH + PAGES_DIR;

    // Функция для нормализации пути статьи
    function normalizeArticlePath(path) {
        // Удаляем начальные /pages/ если они есть
        return path.replace(/^\/?pages\//, '');
    }

    // Функция для получения полного URL статьи
    function getArticleFullUrl(articleName) {
        return FULL_PAGES_PATH + articleName;
    }

    // Корректировка начального URL
    function ensureCorrectInitialUrl() {
        const currentPath = location.pathname;

        if (currentPath === BASE_PATH || currentPath.endsWith('index.html')) {
            history.replaceState({}, '', getArticleFullUrl('mainpage.html'));
        }
        else if (!currentPath.startsWith(FULL_PAGES_PATH)) {
            // Перенаправляем на корректный URL если открыли статью напрямую
            const articleName = currentPath.split('/').pop();
            history.replaceState({}, '', getArticleFullUrl(articleName));
        }
    }
    ensureCorrectInitialUrl();

    // Обработчики прокрутки (без изменений)
    $(window).scroll(function() {
        $('.scrollup').toggle($(this).scrollTop() > 0);
    });
    $('.scrollup').click(function() {
        $('body, html').animate({scrollTop: 0}, 300);
    });

    // Обработка меню (без изменений)
    $('.mainline').click(function() {
        var $content = $(this).next('.sublines');
        var isOpening = !$content.is(':visible');

        if (isOpening) {
            $('.sublines').not($content).slideUp(300);
            $('.mainline').not(this).removeClass('actlines');
            $content.slideDown(300);
            $(this).addClass('actlines');
        } else {
            $content.slideUp(300);
            $(this).removeClass('actlines');
        }
    });

    // Основная функция загрузки статьи
    function loadArticleContent(articleName, $link) {
        const fullUrl = getArticleFullUrl(articleName);
        const currentHeight = $('#maincont').height();

        $('#maincont').css({
            'min-height': currentHeight + 'px',
            'opacity': 0.5
        });

        $.get(fullUrl)
            .done(function(data) {
                const tempDiv = $('<div>').html(data);
                const content = tempDiv.find('#maincont').html();

                $('#maincont').html(content)
                    .css('min-height', 'auto')
                    .animate({opacity: 1}, 300);

                // Сохраняем в истории только относительный путь
                history.pushState({article: articleName}, '', fullUrl);
                updateActiveState($link);
            })
            .fail(function() {
                showError('Статья не найдена');
            });
    }

    // Обработчик кликов по ссылкам в меню
    $('.menulink').click(function(e) {
        e.preventDefault();
        const articleName = normalizeArticlePath($(this).attr('href'));

        if (location.pathname === getArticleFullUrl(articleName)) {
            $('body, html').animate({scrollTop: 0}, 400);
            return;
        }

        loadArticleContent(articleName, $(this));
    });

    // Обработчик внутренних ссылок в статьях
    $(document).on('click', '#maincont a', function(e) {
        e.preventDefault();
        const targetUrl = $(this).attr('href');
        const articleName = normalizeArticlePath(targetUrl);

        if (targetUrl.match(/page\d+\.html/)) {
            scrollToArticle(articleName);
        } else {
            window.location.href = targetUrl;
        }
    });

    // Обработка навигации по истории
    $(window).on('popstate', function(e) {
        const articleName = e.originalEvent.state?.article ||
                          normalizeArticlePath(location.pathname.split('/').pop());

        if (articleName === 'mainpage.html') {
            $('#maincont').empty();
            resetActiveState();
        }
        else if (articleName.match(/page\d+\.html/)) {
            loadArticle(articleName);
        }
    });

    // Инициализация при загрузке
    const initialArticle = normalizeArticlePath(location.pathname.split('/').pop());
    if (initialArticle.match(/page\d+\.html/)) {
        loadInitialArticle(initialArticle);
    }

    // Вспомогательные функции
    function showError(message) {
        $('#maincont').html('<p style="color:red;">' + message + '</p>');
        history.replaceState({}, '', getArticleFullUrl('mainpage.html'));
        resetActiveState();
    }

    function loadInitialArticle(articleName) {
        const $activeLink = $('.menulink[href="' + articleName + '"]');
        if ($activeLink.length) {
            updateActiveState($activeLink);
        }
        $('#maincont').css('opacity', 1);
    }

    function updateActiveState($link) {
        resetActiveState();
        $link.addClass('actlinks')
             .closest('.menulist')
             .find('.mainline')
             .addClass('actlines')
             .next('.sublines')
             .show();
    }

    function resetActiveState() {
        $('.mainline').removeClass('actlines');
        $('.menulink').removeClass('actlinks');
    }

    function scrollToArticle(articleName) {
        if ($(window).scrollTop() > 0) {
            $('body, html').animate({scrollTop: 0}, 400, function() {
                $('.menulink[href="' + articleName + '"]').click();
            });
        } else {
            $('.menulink[href="' + articleName + '"]').click();
        }
    }

    function loadArticle(articleName) {
        const fullUrl = getArticleFullUrl(articleName);
        const currentHeight = $('#maincont').height();

        $('#maincont').css({
            'min-height': currentHeight + 'px',
            'opacity': 0.5
        });

        $.get(fullUrl)
            .done(function(data) {
                const tempDiv = $('<div>').html(data);
                const content = tempDiv.find('#maincont').html();

                $('#maincont').html(content)
                    .css('min-height', 'auto')
                    .animate({opacity: 1}, 300);

                const $activeLink = $('.menulink[href="' + articleName + '"]');
                if ($activeLink.length) {
                    updateActiveState($activeLink);
                }
            })
            .fail(function() {
                showError('Статья не найдена');
            });
    }
});
