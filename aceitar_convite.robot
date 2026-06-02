*** Settings ***
Library    SeleniumLibrary

Suite Teardown    E fecha o navegador

*** Variables ***
${BASE_URL}               http://localhost:5173/convite
${BROWSER}                chrome
${TOKEN_INVALIDO}         token-invalido-000
${TOKEN_EXPIRADO}         substitua-pelo-token-expirado
${TOKEN_VALIDO}           substitua-pelo-token-pendente-valido
${TITULO_EXPIRADO}        xpath=//h1[contains(., 'Convite expirado')]
${BTN_ACEITAR}            xpath=//button[contains(., 'Aceitar convite')]
${BTN_RECUSAR}            xpath=//button[contains(., 'Recusar')]

*** Test Cases ***
CT01 - Deve não exibir botões para token inválido
    Dado que o usuário acessa a tela de convite com token    ${TOKEN_INVALIDO}
    Então os botões de aceitar e recusar não devem ser exibidos

CT02 - Deve exibir mensagem de convite expirado
    Dado que o usuário acessa a tela de convite com token    ${TOKEN_EXPIRADO}
    Então a mensagem de convite expirado deve ser exibida

CT03 - Deve exibir botões de aceitar e recusar para convite válido
    Dado que o usuário acessa a tela de convite com token    ${TOKEN_VALIDO}
    Então os botões de aceitar e recusar devem ser exibidos

*** Keywords ***
Dado que o usuário acessa a tela de convite com token
    [Arguments]    ${token}
    Open Browser    ${BASE_URL}/${token}    ${BROWSER}
    Maximize Browser Window
    Sleep    2s

Então os botões de aceitar e recusar não devem ser exibidos
    Element Should Not Be Visible    ${BTN_ACEITAR}
    Element Should Not Be Visible    ${BTN_RECUSAR}

Então a mensagem de convite expirado deve ser exibida
    Wait Until Element Is Visible    ${TITULO_EXPIRADO}    timeout=10s
    Element Should Not Be Visible    ${BTN_ACEITAR}

Então os botões de aceitar e recusar devem ser exibidos
    Wait Until Element Is Visible    ${BTN_ACEITAR}    timeout=10s
    Element Should Be Visible        ${BTN_RECUSAR}

E fecha o navegador
    Close Browser
