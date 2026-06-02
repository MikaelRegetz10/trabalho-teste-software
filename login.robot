*** Settings ***
Library    SeleniumLibrary

Suite Setup       Dado que o usuário acessa a tela de login
Suite Teardown    E fecha o navegador

*** Variables ***
${URL}             http://localhost:3000/login
${BROWSER}         chrome

${INPUT_EMAIL}     id=email
${INPUT_SENHA}     id=senha
${BOTAO_ENTRAR}    id=btnEntrar
${MENSAGEM}        id=mensagem

*** Test Cases ***
CT01 - Deve realizar login com credenciais válidas
    Dado que o usuário informa o email     maria@email.com
    E informa a senha                      senha123
    Quando solicitar o login
    Então o sistema deve apresentar a mensagem    Login realizado com sucesso

CT02 - Deve informar que usuário não foi encontrado
    Dado que o usuário informa o email     desconhecido@email.com
    E informa a senha                      senha123
    Quando solicitar o login
    Então o sistema deve apresentar a mensagem    Usuário não encontrado

CT03 - Deve informar que a senha está incorreta
    Dado que o usuário informa o email     maria@email.com
    E informa a senha                      errada999
    Quando solicitar o login
    Então o sistema deve apresentar a mensagem    Senha incorreta

CT04 - Deve validar e-mail obrigatório
    Dado que o usuário informa o email
    E informa a senha                      senha123
    Quando solicitar o login
    Então o sistema deve apresentar a mensagem    Campo obrigatório

*** Keywords ***
Dado que o usuário acessa a tela de login
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window

Dado que o usuário informa o email
    [Arguments]    ${email}=${EMPTY}
    Clear Element Text    ${INPUT_EMAIL}
    Input Text    ${INPUT_EMAIL}    ${email}

E informa a senha
    [Arguments]    ${senha}=${EMPTY}
    Clear Element Text    ${INPUT_SENHA}
    Input Password    ${INPUT_SENHA}    ${senha}

Quando solicitar o login
    Click Button    ${BOTAO_ENTRAR}

Então o sistema deve apresentar a mensagem
    [Arguments]    ${mensagem}
    Element Text Should Be    ${MENSAGEM}    ${mensagem}

E fecha o navegador
    Close Browser
