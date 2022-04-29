
var user;
$(function() {
    
    var jsonUser = localStorage.getItem('user');
    if(jsonUser != "undefined") {
        user = JSON.parse(jsonUser);
    }

    if(!user) {
        setUpLoginScreen()
    }

    $("#btnLogout").on("click", function(e){
        localStorage.removeItem('user');
        window.location.reload();
    });

    $("#btnEntrada").on("click", function(e){
        $(".botoes-movimentos").slideUp();
        $("#formEntrada").slideDown();
    })

    $("#btnSaida").on("click", function(e){
        $(".botoes-movimentos").slideUp();
        $("#formSaida").slideDown();
    })

    $(".form-movimentos .movimentos-cancelar").on("click", function(e) {
        $(".botoes-movimentos").slideDown();
        $(".form-movimentos").slideUp();
    })


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