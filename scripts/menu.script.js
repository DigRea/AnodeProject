$(function() {
    // Раскрытие/сворачивание разделов меню
    $('.mainline').click(function() {
        const $section = $(this).closest('.menulist');
        const $content = $section.find('.sublines');

        // Закрываем все другие разделы
        $('.menulist').not($section).find('.sublines').slideUp();
        $('.menulist').not($section).find('.mainline').removeClass('active');

        // Переключаем текущий раздел
        $content.slideToggle();
        $(this).toggleClass('active');
    });
});
