*** Settings ***
Library    SeleniumLibrary

Suite Setup       Dado que o usuário acessa a página de membros
Suite Teardown    E fecha o navegador

*** Variables ***
${URL}                    http://localhost:5173/membros
${BROWSER}                chrome
${BTN_CONVIDAR}           xpath=//button[contains(., 'Convidar familiar')]
${INPUT_EMAIL}            xpath=//input[@type='email']
${BTN_GERAR}              xpath=//button[contains(., 'Gerar convite')]
${LINK_CONVITE}           xpath=//code
${BTN_COPIAR}             xpath=//button[contains(., 'Copiar')]

*** Test Cases ***
CT01 - Deve impedir envio com e-mail vazio
    Dado que o modal de convite está aberto
    Quando o usuário clica em gerar convite sem preencher o e-mail
    Então o modal permanece aberto sem exibir link de convite

CT02 - Deve impedir envio com e-mail inválido
    Dado que o modal de convite está aberto
    E informa o e-mail    familiaremailcom
    Quando o usuário clica em gerar convite sem preencher o e-mail
    Então o modal permanece aberto sem exibir link de convite

CT03 - Deve exibir link de convite com e-mail válido
    Dado que o modal de convite está aberto
    E informa o e-mail    familiar@email.com
    Quando o usuário clica em gerar convite
    Então o link de convite é exibido na tela

*** Keywords ***
Dado que o usuário acessa a página de membros
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Wait Until Element Is Visible    ${BTN_CONVIDAR}    timeout=10s

Dado que o modal de convite está aberto
    Click Button    ${BTN_CONVIDAR}
    Wait Until Element Is Visible    ${INPUT_EMAIL}    timeout=5s

E informa o e-mail
    [Arguments]    ${email}
    Input Text    ${INPUT_EMAIL}    ${email}

Quando o usuário clica em gerar convite sem preencher o e-mail
    Click Button    ${BTN_GERAR}

Quando o usuário clica em gerar convite
    Click Button    ${BTN_GERAR}

Então o modal permanece aberto sem exibir link de convite
    Element Should Be Visible    ${INPUT_EMAIL}
    Element Should Not Be Visible    ${LINK_CONVITE}

Então o link de convite é exibido na tela
    Wait Until Element Is Visible    ${LINK_CONVITE}    timeout=10s
    Element Should Be Visible    ${BTN_COPIAR}

E fecha o navegador
    Close Browser
