$(function() {
    // Показываем/скрываем кнопку прокрутки
    $(window).scroll(function() {
        if ($(this).scrollTop() != 0) {
            $('.scrollup').fadeIn();
        } else {
            $('.scrollup').fadeOut();
        }
    });

    // Обработчик клика по кнопке прокрутки
    $('.scrollup').click(function() {
        $('body, html').animate({ scrollTop: 0 }, 400);
    });
});
