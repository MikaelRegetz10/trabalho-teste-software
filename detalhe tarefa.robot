*** Settings ***
Library    SeleniumLibrary

Suite Setup       Dado que o usuário está autenticado e acessa o dashboard
Suite Teardown    E fecha o navegador

*** Variables ***
${BASE_URL}               http://localhost:5173
${BROWSER}                chrome

${CARD_TAREFA}            xpath=//button[contains(@class, 'rounded-2xl') and contains(@class, 'bg-card')]
${CARD_TAREFA_CRITICA}    xpath=//button[contains(@class, 'ring-warning')]
${BTN_CONCLUIR}           xpath=//button[contains(., 'Concluir')]
${BTN_CANCELAR}           xpath=//button[contains(., 'Cancelar')]
${BTN_EDITAR}             xpath=//button[contains(., 'Editar tarefa')]
${BTN_FECHAR}             xpath=//button[contains(@aria-label, 'fechar') or contains(@class, 'rounded-full') and .//*[name()='svg']]
${MODAL_DETALHE}          xpath=//div[contains(@class, 'fixed') and contains(@class, 'inset-0') and contains(@class, 'z-50')]
${TITULO_MODAL}           xpath=//div[contains(@class, 'fixed')]//h2
${HISTORICO_SECTION}      xpath=//h3[contains(., 'Histórico')]
${HISTORICO_LISTA}        xpath=//ol[contains(@class, 'border-l-2')]
${BADGE_CRITICA}          xpath=//span[contains(., 'crítica')]
${CONFIRMACAO_MODAL}      xpath=//h3[contains(., 'Confirmar conclusão') or contains(., 'Cancelar tarefa')]
${BTN_CONFIRMAR}          xpath=//button[contains(., 'Confirmar')]
${BTN_VOLTAR}             xpath=//button[contains(., 'Voltar')]

*** Test Cases ***
CT01 - Deve abrir modal de detalhe ao clicar em uma tarefa
    Dado que o dashboard possui tarefas listadas
    Quando o usuário clica em um card de tarefa
    Então o modal de detalhe deve ser exibido
    E o modal deve conter título da tarefa

CT02 - Deve exibir histórico no detalhe da tarefa
    Dado que o dashboard possui tarefas listadas
    Quando o usuário clica em um card de tarefa
    Então o modal de detalhe deve ser exibido
    E a seção de histórico deve estar visível
    E a lista de histórico deve conter pelo menos um item

CT03 - Deve exibir badge crítica para tarefas críticas
    Dado que existe uma tarefa crítica no dashboard
    Quando o usuário clica na tarefa crítica
    Então o modal de detalhe deve ser exibido
    E o badge crítica deve ser visível no card

CT04 - Deve exibir botões de ação para tarefa pendente
    Dado que o dashboard possui tarefas listadas
    Quando o usuário clica em um card de tarefa pendente
    Então o modal de detalhe deve ser exibido
    E o botão concluir deve estar visível
    E o botão cancelar deve estar visível
    E o botão editar tarefa deve estar visível

CT05 - Deve exibir modal de confirmação ao clicar em Concluir
    Dado que o dashboard possui tarefas listadas
    Quando o usuário clica em um card de tarefa pendente
    E clica no botão Concluir
    Então o modal de confirmação deve ser exibido

CT06 - Deve fechar modal de confirmação ao clicar em Voltar
    Dado que o dashboard possui tarefas listadas
    Quando o usuário clica em um card de tarefa pendente
    E clica no botão Concluir
    E clica no botão Voltar
    Então o modal de detalhe deve ainda estar visível
    E o modal de confirmação não deve estar visível

*** Keywords ***
Dado que o usuário está autenticado e acessa o dashboard
    Open Browser    ${BASE_URL}/login    ${BROWSER}
    Maximize Browser Window
    Wait Until Element Is Visible    xpath=//input[@type='email']    timeout=10s
    Input Text    xpath=//input[@type='email']    usuario@teste.com
    Input Password    xpath=//input[@type='password']    senha123456
    Click Button    xpath=//button[@type='submit']
    Wait Until Location Contains    /dashboard    timeout=10s

Dado que o dashboard possui tarefas listadas
    Wait Until Element Is Visible    ${CARD_TAREFA}    timeout=10s

Dado que existe uma tarefa crítica no dashboard
    Wait Until Element Is Visible    ${CARD_TAREFA_CRITICA}    timeout=10s

Quando o usuário clica em um card de tarefa
    Click Element    ${CARD_TAREFA}
    Sleep    1s

Quando o usuário clica em um card de tarefa pendente
    Click Element    ${CARD_TAREFA}
    Sleep    1s

Quando clica no botão Concluir
    Wait Until Element Is Visible    ${BTN_CONCLUIR}    timeout=5s
    Click Button    ${BTN_CONCLUIR}
    Sleep    0.5s

Quando clica no botão Voltar
    Wait Until Element Is Visible    ${BTN_VOLTAR}    timeout=5s
    Click Button    ${BTN_VOLTAR}
    Sleep    0.5s

Quando o usuário clica na tarefa crítica
    Click Element    ${CARD_TAREFA_CRITICA}
    Sleep    1s

Então o modal de detalhe deve ser exibido
    Wait Until Element Is Visible    ${MODAL_DETALHE}    timeout=5s

Então o modal deve conter título da tarefa
    Wait Until Element Is Visible    ${TITULO_MODAL}    timeout=5s
    ${titulo}=    Get Text    ${TITULO_MODAL}
    Should Not Be Empty    ${titulo}

Então a seção de histórico deve estar visível
    Wait Until Element Is Visible    ${HISTORICO_SECTION}    timeout=5s

Então a lista de histórico deve conter pelo menos um item
    Wait Until Element Is Visible    ${HISTORICO_LISTA}    timeout=5s
    ${itens}=    Get Element Count    xpath=//ol[contains(@class,'border-l-2')]/li
    Should Be True    ${itens} >= 1

Então o badge crítica deve ser visível no card
    Element Should Be Visible    ${BADGE_CRITICA}

Então o botão concluir deve estar visível
    Wait Until Element Is Visible    ${BTN_CONCLUIR}    timeout=5s

Então o botão cancelar deve estar visível
    Element Should Be Visible    ${BTN_CANCELAR}

Então o botão editar tarefa deve estar visível
    Element Should Be Visible    ${BTN_EDITAR}

Então o modal de confirmação deve ser exibido
    Wait Until Element Is Visible    ${CONFIRMACAO_MODAL}    timeout=5s

Então o modal de confirmação não deve estar visível
    Element Should Not Be Visible    ${CONFIRMACAO_MODAL}

Então o modal de detalhe deve ainda estar visível
    Element Should Be Visible    ${MODAL_DETALHE}

E fecha o navegador
    Close Browser
