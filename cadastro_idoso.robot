*** Settings ***
Library    SeleniumLibrary

Suite Setup       Dado que o usuário autenticado acessa o formulário de cadastro de idoso
Suite Teardown    E fecha o navegador

*** Variables ***
${URL_LOGIN}        http://localhost:3000/login
${URL_CADASTRO}     http://localhost:3000/idosos/novo
${BROWSER}          chrome

${INPUT_EMAIL_LOGIN}   id=email
${INPUT_SENHA_LOGIN}   id=senha
${BOTAO_LOGIN}         id=btnEntrar

${INPUT_NOME}          id=nome
${INPUT_DATA}          id=dataNascimento
${INPUT_OBS}           id=observacoes
${BOTAO_SALVAR}        id=btnSalvar
${MENSAGEM}            id=mensagem

*** Test Cases ***
CT01 - Deve cadastrar idoso com dados válidos
    Dado que o usuário informa o nome do idoso       Dona Cleonice
    E informa a data de nascimento                   12/03/1945
    E informa as observações                         Hipertensa, toma remédio às 8h e 20h
    Quando solicitar o cadastro do idoso
    Então o sistema deve apresentar a mensagem       Idoso cadastrado com sucesso

CT02 - Deve validar nome obrigatório
    Dado que o usuário informa o nome do idoso
    E informa a data de nascimento                   12/03/1945
    Quando solicitar o cadastro do idoso
    Então o sistema deve apresentar a mensagem       Nome obrigatório

CT03 - Deve validar data de nascimento inválida
    Dado que o usuário informa o nome do idoso       Dona Cleonice
    E informa a data de nascimento                   40/15/2026
    Quando solicitar o cadastro do idoso
    Então o sistema deve apresentar a mensagem       Data de nascimento inválida

CT04 - Deve validar que a pessoa não é idosa
    Dado que o usuário informa o nome do idoso       Carlos Souza
    E informa a data de nascimento                   10/05/2000
    Quando solicitar o cadastro do idoso
    Então o sistema deve apresentar a mensagem       Idade não corresponde a idoso

*** Keywords ***
Dado que o usuário autenticado acessa o formulário de cadastro de idoso
    Open Browser    ${URL_LOGIN}    ${BROWSER}
    Maximize Browser Window
    Input Text        ${INPUT_EMAIL_LOGIN}    maria@email.com
    Input Password    ${INPUT_SENHA_LOGIN}    senha123
    Click Button      ${BOTAO_LOGIN}
    Go To    ${URL_CADASTRO}

Dado que o usuário informa o nome do idoso
    [Arguments]    ${nome}=${EMPTY}
    Clear Element Text    ${INPUT_NOME}
    Input Text    ${INPUT_NOME}    ${nome}

E informa a data de nascimento
    [Arguments]    ${data}=${EMPTY}
    Clear Element Text    ${INPUT_DATA}
    Input Text    ${INPUT_DATA}    ${data}

E informa as observações
    [Arguments]    ${obs}=${EMPTY}
    Clear Element Text    ${INPUT_OBS}
    Input Text    ${INPUT_OBS}    ${obs}

Quando solicitar o cadastro do idoso
    Click Button    ${BOTAO_SALVAR}

Então o sistema deve apresentar a mensagem
    [Arguments]    ${mensagem}
    Element Text Should Be    ${MENSAGEM}    ${mensagem}

E fecha o navegador
    Close Browser
