function fillTable() {
    $.ajax({
        url: '/list_files?fs=' + $("#current").val(),
        method: 'GET'
    }).then(function (data) {
        var table = $('.fs_table > tbody:last-child');
        table.empty();
        $("#current").val(data.current);
        $.each(data.files, function (key, value) {
            if(value.isDir){
                table.append('<tr class="fs_table_row"><br />'
                + '<td class="fs_table_cell_selection"><br />'
                + '<input type="checkbox" name="selected" value="TRUE"></input><br />'
                + '</td><br />'
                + '<td class="fs_table_cell_name"><br />'
                + '<p><a style="color:blue;">' + value.name + '</a></p><br />'
                + '</td><br />'
                + '<td class="fs_table_cell_size"><br />'
                + '<p>dir</p><br />'
                + '</td><br />'
                + '<td class="fs_table_cell_perm"><br />'
                + '<p>' + value.perm + '</p><br />'
                + '</td><br />'
                + '</tr><br />');
            }
        });
        $.each(data.files, function (key, value) {
            if(!value.isDir){
                table.append('<tr class="fs_table_row"><br />'
                + '<td class="fs_table_cell_selection"><br />'
                + '<input type="checkbox" name="selected" value="TRUE"></input><br />'
                + '</td><br />'
                + '<td class="fs_table_cell_name"><br />'
                + '<p style="color:green;">' + value.name + '</p><br />'
                + '</td><br />'
                + '<td class="fs_table_cell_size"><br />'
                + '<p>' + value.size + '</p><br />'
                + '</td><br />'
                + '<td class="fs_table_cell_perm"><br />'
                + '<p>' + value.perm + '</p><br />'
                + '</td><br />'
                + '</tr><br />');
            }
        });
        styleOveride();
    });
};