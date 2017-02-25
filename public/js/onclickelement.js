$(function () {
    $('.fs_table_row').not('.fs_table_header_row')
            .filter(":even")
            .css("background-color", "#dee0fe");

    $('.fs_table_row').not('.fs_table_header_row')
            .filter(":odd")
            .css("background-color", "#FFFFFF");

    $('.fs_table_row').not('.fs_table_header_row').hover(function () {
        $(this).css("background-color", "#aeb2fe");
    }, function () {
        if ($('.fs_table_row').not('.fs_table_header_row').index($(this)) % 2 == 0) {
            $(this).css("background-color", "#dee0fe");
        } else {
            $(this).css("background-color", "#FFFFFF");
        }
    });

    $('.fs_table_row').not('.fs_table_header_row')
            .filter(function (index, elem) {
                return $(elem).find("a").length > 0;
            })
            .each(function (index, elem) {
                $(elem).dblclick(function () {
                    window.location.href = $(elem).find("a").attr("href");
                });
            });
});
