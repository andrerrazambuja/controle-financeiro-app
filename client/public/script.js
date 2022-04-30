
var user;
$(function() {
    
    var jsonUser = localStorage.getItem('user');
    if(jsonUser != "undefined") {
        user = JSON.parse(jsonUser);
    }

    if(!user) {
        setUpLoginScreen()
    }
    else{
        setUpHomePage(user);
    }

    $("#btnLogout").on("click", function(e){
        localStorage.removeItem('user');
        window.location.reload();
    });


})

var registrationState = false;
function setUpLoginScreen(){

    $(".login-container").show();

    //#region LOGIN/REGISTRO
    $("#btnRegistrar").on("click", function(e) {
        e.preventDefault();

        $(".login-content span.span-error").text("");

        registrationState = true;

        $("#confirmPassword").slideDown();
        $("#btnRegistrar").hide();
        $("#btnVoltarLogin").show();

        $(".login-content .title-login").text("Registro");
        $(".login-content input").val(null);
        
    })

    $("#btnVoltarLogin").on("click", function(e) {
        e.preventDefault();

        $(".login-content span.span-error").text("");

        registrationState = false;

        $("#confirmPassword").slideUp();
        $("#btnVoltarLogin").hide();
        $("#btnRegistrar").show();

        $(".login-content .title-login").text("Login");
        $(".login-content input").val(null);

    })

    $("#btnConfirmar").on("click", function(e) {

        $(".login-content span.span-error").text("");

        let dados = {
            username: $("#username").val(),
            password: $("#password").val(),
        }

        //Confirmar Registro
        if(registrationState){

            if(!dados.password || !dados.username || !$("#confirmPassword").val()){
                $(".login-content span.span-error").text("Preencha todos os dados.");
                return false;
            }

            if(dados.password != $("#confirmPassword").val()){
                $(".login-content span.span-error").text("As senhas não coincindem");
                return false;
            }

            $.ajax({
                type: "POST",
                url: `http://localhost:6060/auth/register/`,
                data: dados,
                success: function (result) {
                    $("#btnVoltarLogin").click();
                    window.alert("Registrado com sucesso. Faça login para continuar.")
                },
                error: function (result) {
                    console.log(result)
                    $(".login-content span.span-error").text(result.responseJSON.message);
                    return false;
                }
            });

        }
        //Confirmar Login
        else{

            if(!dados.password || !dados.username){
                $(".login-content span.span-error").text("Preencha usuário/senha para confirmar.");
                return false;
            }

            $.ajax({
                type: "GET",
                url: `http://localhost:6060/auth/${dados.username}/${dados.password}`,
                success: function (result) {
                    console.log(result)

                    if(result.auth){
                        delete result.user.password;
                        localStorage.setItem('user', JSON.stringify(result.user));
                        setUpHomePage(result.user)
                        $(".login-container").hide();
                    }
                    else{
                        $(".login-content span.span-error").text(result.message);
                        return false;

                    }
                },
                error: function (result) {
                    console.log(result)
                    $(".login-content span.span-error").text("Algo deu errado.");
                    return false;
                }
            });

        }

    })
    //#endregion LOGIN


}

function setUpHomePage(user){

    carregarExtrato(user);

    //TRIGGERS ENTRADAS/SAÍDAS
    $("#btnEntrada").on("click", function(e){
        $(".botoes-movimentos").slideUp();
        $("#formEntrada").slideDown();
    })

    $("#btnSaida").on("click", function(e){
        $(".botoes-movimentos").slideUp();
        $("#formSaida").slideDown();
    })

    //cancelar
    $(".form-movimentos .movimentos-cancelar").on("click", function(e) {
        $(".botoes-movimentos").slideDown();
        $(".form-movimentos").slideUp();
        $(".form-movimentos input").val(null);
    })

    //confirmar add entrada
    $("#formEntrada .movimentos-confirmar").on("click", function(e){

        let val = $("#formEntrada input#entrada").val();

        dados = {
            tipoId: 1,
            userId: user.id,
            valor: val
        }

        if(val <= 0){
            window.alert("Valor não pode ser menor que ou igual a 0.")
            return false;
        }

        $.ajax({
            type: "POST",
            url: `http://localhost:6060/movimento/add/`,
            data: dados,
            success: function (result) {
                $(".botoes-movimentos").slideDown();
                $(".form-movimentos").slideUp();
                $(".form-movimentos input").val(null);
                carregarExtrato();
            },
            error: function (result) {
                console.log(result);
                window.alert(result.message);
            }
        });

    })
    
    //confirmar add saída
    $("#formSaida .movimentos-confirmar").on("click", function(e){

        let val = $("#formSaida input#saida").val();
        let tipo = $("#formSaida select#tipoSaida").val();

        dados = {
            tipoId: tipo,
            userId: user.id,
            valor: val
        }

        if(val <= 0){
            window.alert("Valor não pode ser menor que ou igual a 0.")
            return false;
        }

        if(tipo == 1){
            window.alert("Tipo inválido.")
            return false;
        }

        $.ajax({
            type: "POST",
            url: `http://localhost:6060/movimento/add/`,
            data: dados,
            success: function (result) {
                $(".botoes-movimentos").slideDown();
                $(".form-movimentos").slideUp();
                $(".form-movimentos input").val(null);
                carregarExtrato();
            },
            error: function (result) {
                console.log(result);
                window.alert(result.responseJSON.message);
            }
        });

    })

}


function carregarExtrato(dados){

    if(dados) user = dados;

    $.ajax({
        type: "GET",
        url: `http://localhost:6060/extrato/${user.id}/`,
        success: function (result) {

            $(".table-extrato tbody").html("");

            if(!result.extrato.length){
                $(".table-extrato tbody").append(`
                <tr>
                    <td colspan="4" style="text-align:center">Você ainda não possui nenhum movimento, assim que você tiver, eles irão aparecer aqui.</td>
                </tr>`)
                return false;
            };

            result.extrato.forEach(movimento => {
                $(".table-extrato tbody").append(`
                <tr class="${movimento.tipo_id == 1 ? 'linha-entrada' : 'linha-saida'}">
                    <td>${movimento.descricao}</td>
                    <td class="td-valor">R$${movimento.valor.toFixed(2)}</td>
                    <td>${moment(movimento.data, "YYYY-MM-DD").format("DD/MM/YYYY")}</td>
                    <td><button class="btn-excluir-tabela" onclick="excluirMovimento(${movimento.movimento_id})">Excluir</button></td>
                </tr>`)
            });

            let totalEntradas = 0;
            let totalSaidas = 0;

            let entradas = new Array();
            let saidas = new Array();

            result.extrato.map(movimento =>{
                if(movimento.tipo_id == 1){
                    entradas.push(movimento);
                    totalEntradas += movimento.valor;
                }
                else{
                    saidas.push(movimento);
                    totalSaidas += movimento.valor;
                }
            })

            let saldo = totalEntradas - totalSaidas;

           $("#cardSaldo .card-value").text("R$" + saldo.toFixed(2));
           $("#cardEntradas .card-value").text("R$" + totalEntradas.toFixed(2));
           $("#cardSaidas .card-value").text("R$" + totalSaidas.toFixed(2));


        },
        error: function (result) {
            console.log(result)
        }
    });
}

function excluirMovimento(movimentoId){

    dados = {
        movimentoId: movimentoId,
        userId: user.id
    }

    $.ajax({
        type: "POST",
        url: `http://localhost:6060/movimento/delete/`,
        data: dados,
        success: function (result) {
            carregarExtrato();
        },
        error: function (result) {
            console.log(result);
            window.alert(result.message);
        }
    });
}
