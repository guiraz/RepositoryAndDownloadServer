function debrid() {
    var glasspane = $('#glass');
    glasspane.css("display", "block");

    glasspane.click(function () {
        glasspane.css("display", "none");
    });

    $('#option_pane').click(function (event) {
        event.stopPropagation();
    });

    return false;
}