*** Settings ***
Library    SeleniumLibrary

Suite Setup       Dado que o usuário está autenticado e acessa a página de membros
Suite Teardown    E fecha o navegador

*** Variables ***
${BASE_URL}               http://localhost:5173
${BROWSER}                chrome

${TITULO_PAGINA}          xpath=//h1[contains(., 'A família') or contains(., 'família')]
${HEADER_GRUPO}           xpath=//span[contains(@class, 'font-medium') and contains(., 'cuidando de')]
${NOME_IDOSO_HEADER}      xpath=//span[contains(@class, 'font-medium')]//strong
${LISTA_MEMBROS}          xpath=//div[contains(@class, 'space-y') and .//div[contains(@class, 'rounded-2xl')]]
${CARD_MEMBRO}            xpath=//div[contains(@class, 'rounded-2xl') and contains(@class, 'border')]
${BTN_CONVIDAR}           xpath=//button[contains(., 'Convidar')]
${CAMPO_EMAIL_CONVITE}    xpath=//input[@type='email']
${BTN_ENVIAR_CONVITE}     xpath=//button[contains(., 'Gerar link') or contains(., 'Enviar')]
${BTN_REMOVER_MEMBRO}     xpath=//button[contains(@aria-label, 'remover') or .//*[name()='svg' and contains(@class, 'trash') or contains(@data-lucide,'trash')]]
${DIALOG_CONFIRMACAO}     xpath=//div[contains(@class, 'fixed') and contains(@class, 'inset-0')]
${BTN_CONFIRMAR_REMOCAO}  xpath=//button[contains(., 'Confirmar') or contains(., 'Remover')]
${NOME_IDOSO_BADGE}       xpath=//div[contains(@class, 'rounded-full')]//strong
${NAV_FAMILIA}            xpath=//a[contains(., 'Família') or contains(@href, 'membros')]

*** Test Cases ***
CT01 - Deve exibir a página da família com título correto
    Dado que o usuário acessa a aba Família
    Então o título da página deve ser exibido
    E o nome do idoso deve aparecer no cabeçalho do sistema

CT02 - Deve listar os membros do grupo familiar
    Dado que o usuário acessa a aba Família
    Então a lista de membros deve conter pelo menos um card

CT03 - Deve exibir o nome do idoso no cabeçalho de navegação
    Dado que o usuário acessa a aba Família
    Então o cabeçalho deve exibir a identificação do grupo e do idoso

CT04 - Deve abrir o formulário de convite ao clicar em Convidar
    Dado que o usuário acessa a aba Família
    Quando o usuário clica no botão Convidar
    Então o formulário de convite deve ser exibido

CT05 - Deve validar campo de email no formulário de convite
    Dado que o usuário acessa a aba Família
    Quando o usuário clica no botão Convidar
    E preenche o campo de email do convite com valor inválido
    Então o botão de envio deve permanecer acessível
    E o sistema não deve navegar para outra tela

CT06 - Deve exibir confirmação antes de remover membro
    Dado que o usuário acessa a aba Família
    E há pelo menos um membro removível listado
    Quando o usuário clica no botão de remover de um membro
    Então um diálogo de confirmação deve ser exibido

*** Keywords ***
Dado que o usuário está autenticado e acessa a página de membros
    Open Browser    ${BASE_URL}/login    ${BROWSER}
    Maximize Browser Window
    Wait Until Element Is Visible    xpath=//input[@type='email']    timeout=10s
    Input Text    xpath=//input[@type='email']    usuario@teste.com
    Input Password    xpath=//input[@type='password']    senha123456
    Click Button    xpath=//button[@type='submit']
    Wait Until Location Contains    /dashboard    timeout=10s

Dado que o usuário acessa a aba Família
    Click Element    ${NAV_FAMILIA}
    Wait Until Location Contains    /membros    timeout=10s
    Sleep    1s

E há pelo menos um membro removível listado
    Wait Until Element Is Visible    ${CARD_MEMBRO}    timeout=10s
    ${count}=    Get Element Count    ${CARD_MEMBRO}
    Should Be True    ${count} >= 1

Quando o usuário clica no botão Convidar
    Wait Until Element Is Visible    ${BTN_CONVIDAR}    timeout=5s
    Click Button    ${BTN_CONVIDAR}
    Sleep    0.5s

Quando o usuário clica no botão de remover de um membro
    Wait Until Element Is Visible    ${BTN_REMOVER_MEMBRO}    timeout=5s
    Click Element    ${BTN_REMOVER_MEMBRO}
    Sleep    0.5s

E preenche o campo de email do convite com valor inválido
    Wait Until Element Is Visible    ${CAMPO_EMAIL_CONVITE}    timeout=5s
    Input Text    ${CAMPO_EMAIL_CONVITE}    email-invalido

Então o título da página deve ser exibido
    Wait Until Element Is Visible    ${TITULO_PAGINA}    timeout=5s
    ${texto}=    Get Text    ${TITULO_PAGINA}
    Should Not Be Empty    ${texto}

Então o nome do idoso deve aparecer no cabeçalho do sistema
    Element Should Be Visible    ${NOME_IDOSO_HEADER}

Então a lista de membros deve conter pelo menos um card
    Wait Until Element Is Visible    ${CARD_MEMBRO}    timeout=10s
    ${count}=    Get Element Count    ${CARD_MEMBRO}
    Should Be True    ${count} >= 1

Então o cabeçalho deve exibir a identificação do grupo e do idoso
    Wait Until Element Is Visible    ${HEADER_GRUPO}    timeout=5s
    ${texto}=    Get Text    ${HEADER_GRUPO}
    Should Contain    ${texto}    cuidando de

Então o formulário de convite deve ser exibido
    Wait Until Element Is Visible    ${CAMPO_EMAIL_CONVITE}    timeout=5s

Então o botão de envio deve permanecer acessível
    Element Should Be Visible    ${BTN_ENVIAR_CONVITE}

Então o sistema não deve navegar para outra tela
    Location Should Contain    /membros

Então um diálogo de confirmação deve ser exibido
    Wait Until Element Is Visible    ${DIALOG_CONFIRMACAO}    timeout=5s

E fecha o navegador
    Close Browser
