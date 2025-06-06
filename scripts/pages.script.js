$(function() {
    // Обработчик клика по ссылке на статью
    $('.menulink').click(function(e) {
        e.preventDefault();

        const page = $(this).data('page');
        const $articleLink = $(this);
        const $sectionTitle = $articleLink.closest('.menulist').find('.mainline');

        // Подсвечиваем выбранную статью и раздел
        $('.menulink').removeClass('active');
        $articleLink.addClass('active');
        $('.mainline').removeClass('active');
        $sectionTitle.addClass('active');

        // Раскрываем раздел, если он закрыт
        $articleLink.closest('.sublines').slideDown();
        $sectionTitle.addClass('active');

        // Загружаем статью
        loadArticle(page);
    });

    // Функция загрузки статьи
    function loadArticle(page) {
        const $mainCont = $('#maincont');

        // Если страница прокручена вниз, сначала прокручиваем вверх
        if ($(window).scrollTop() > $(window).height()) {
            $('body, html').animate({ scrollTop: 0 }, 400, function() {
                loadContent();
            });
        } else {
            loadContent();
        }

        function loadContent() {
            $mainCont.addClass('fade-out');

            setTimeout(function() {
                // Загрузка статьи (в реальном проекте — запрос к БД)
                $.get('../pages/' + page, function(data) {
                    $mainCont.html(data);
                    $mainCont.removeClass('fade-out');

                    // Обработка внутренних ссылок в статье
                    processArticleLinks();
                }).fail(function() {
                    $mainCont.html('<p>Ошибка загрузки статьи. Пожалуйста, попробуйте позже.</p>');
                    $mainCont.removeClass('fade-out');
                });
            }, 500);
        }
    }

    // Обработка ссылок внутри статей
    function processArticleLinks() {
        $('#maincont').find('a').click(function(e) {
            e.preventDefault();
            const href = $(this).attr('href');

            if (href.startsWith('#')) {
                // Якорные ссылки (прокрутка внутри страницы)
                const target = $(href);
                if (target.length) {
                    $('body, html').animate({
                        scrollTop: target.offset().top
                    }, 500);
                }
            } else {
                // Ссылки на другие статьи (прокрутка вверх перед загрузкой)
                if ($(window).scrollTop() > $(window).height()) {
                    $('body, html').animate({ scrollTop: 0 }, 400, function() {
                        window.location.href = href;
                    });
                } else {
                    window.location.href = href;
                }
            }
        });
    }
});
