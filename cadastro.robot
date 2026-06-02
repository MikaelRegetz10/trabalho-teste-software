*** Settings ***
Library    SeleniumLibrary

Suite Setup       Dado que o usuário acessa a tela de cadastro
Suite Teardown    E fecha o navegador

*** Variables ***
${URL}                 http://localhost:3000/cadastro
${BROWSER}             chrome

${INPUT_NOME}          id=nome
${INPUT_EMAIL}         id=email
${INPUT_SENHA}         id=senha
${INPUT_CONFIRMAR}     id=confirmarSenha
${BOTAO_CADASTRAR}     id=btnCadastrar
${MENSAGEM}            id=mensagem

*** Test Cases ***
CT01 - Deve realizar cadastro com dados válidos
    Dado que o usuário informa o nome      Maria Silva
    E informa o email                      maria@email.com
    E informa a senha                      senha123
    E confirma a senha                     senha123
    Quando solicitar o cadastro
    Então o sistema deve apresentar a mensagem    Cadastro realizado com sucesso

CT02 - Deve validar nome obrigatório
    Dado que o usuário informa o nome
    E informa o email                      maria@email.com
    E informa a senha                      senha123
    E confirma a senha                     senha123
    Quando solicitar o cadastro
    Então o sistema deve apresentar a mensagem    Nome obrigatório

CT03 - Deve validar e-mail inválido
    Dado que o usuário informa o nome      Maria Silva
    E informa o email                      mariaemail.com
    E informa a senha                      senha123
    E confirma a senha                     senha123
    Quando solicitar o cadastro
    Então o sistema deve apresentar a mensagem    E-mail inválido

CT04 - Deve validar senha inválida
    Dado que o usuário informa o nome      Maria Silva
    E informa o email                      maria@email.com
    E informa a senha                      123
    E confirma a senha                     123
    Quando solicitar o cadastro
    Então o sistema deve apresentar a mensagem    Senha inválida

CT05 - Deve validar senhas que não conferem
    Dado que o usuário informa o nome      Maria Silva
    E informa o email                      maria@email.com
    E informa a senha                      senha123
    E confirma a senha                     321abcde
    Quando solicitar o cadastro
    Então o sistema deve apresentar a mensagem    Senhas não conferem

*** Keywords ***
Dado que o usuário acessa a tela de cadastro
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window

Dado que o usuário informa o nome
    [Arguments]    ${nome}=${EMPTY}
    Clear Element Text    ${INPUT_NOME}
    Input Text    ${INPUT_NOME}    ${nome}

E informa o email
    [Arguments]    ${email}=${EMPTY}
    Clear Element Text    ${INPUT_EMAIL}
    Input Text    ${INPUT_EMAIL}    ${email}

E informa a senha
    [Arguments]    ${senha}=${EMPTY}
    Clear Element Text    ${INPUT_SENHA}
    Input Password    ${INPUT_SENHA}    ${senha}

E confirma a senha
    [Arguments]    ${confirmar}=${EMPTY}
    Clear Element Text    ${INPUT_CONFIRMAR}
    Input Password    ${INPUT_CONFIRMAR}    ${confirmar}

Quando solicitar o cadastro
    Click Button    ${BOTAO_CADASTRAR}

Então o sistema deve apresentar a mensagem
    [Arguments]    ${mensagem}
    Element Text Should Be    ${MENSAGEM}    ${mensagem}

E fecha o navegador
    Close Browser
