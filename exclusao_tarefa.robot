*** Settings ***
Library           SeleniumLibrary
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close All Browsers
Resource          ../resources/common.robot

*** Variables ***
${BASE_URL}       http://localhost:3000
${BROWSER}        chrome
${EMAIL_CRIADOR}  criador@teste.com
${SENHA_CRIADOR}  senha123
${EMAIL_MEMBRO}   membro@teste.com
${SENHA_MEMBRO}   senha456
${TAREFA_ID}      15

*** Test Cases ***
CT01 - Criador exclui tarefa confirmando no modal
    [Documentation]    Criador confirma exclusão e tarefa é removida da lista
    Fazer Login    ${EMAIL_CRIADOR}    ${SENHA_CRIADOR}
    Navegar Para Lista de Tarefas
    Clicar em Excluir Tarefa    ${TAREFA_ID}
    Confirmar Exclusão no Modal
    Verificar Que Tarefa Foi Removida    ${TAREFA_ID}
    Verificar Mensagem de Sucesso    Tarefa excluída com sucesso

CT02 - Criador cancela exclusão no modal
    [Documentation]    Criador cancela exclusão e tarefa permanece na lista
    Fazer Login    ${EMAIL_CRIADOR}    ${SENHA_CRIADOR}
    Navegar Para Lista de Tarefas
    Clicar em Excluir Tarefa    ${TAREFA_ID}
    Cancelar Exclusão no Modal
    Verificar Que Tarefa Ainda Existe    ${TAREFA_ID}

CT03 - Membro sem permissão não vê botão de excluir (RN08)
    [Documentation]    Usuário sem permissão não deve ter acesso ao botão de exclusão
    Fazer Login    ${EMAIL_MEMBRO}    ${SENHA_MEMBRO}
    Navegar Para Lista de Tarefas
    Verificar Que Botão Excluir Não Existe

CT04 - Admin exclui tarefa de outro membro
    [Documentation]    Admin confirma exclusão de tarefa e ela é removida
    Fazer Login    admin@teste.com    adminsenha
    Navegar Para Lista de Tarefas
    Clicar em Excluir Tarefa    ${TAREFA_ID}
    Confirmar Exclusão no Modal
    Verificar Que Tarefa Foi Removida    ${TAREFA_ID}
    Verificar Mensagem de Sucesso    Tarefa excluída com sucesso

*** Keywords ***
Fazer Login
    [Arguments]    ${email}    ${senha}
    Go To    ${BASE_URL}/login
    Input Text    id=campo-email    ${email}
    Input Text    id=campo-senha    ${senha}
    Click Button    id=btn-entrar
    Wait Until Element Is Visible    id=menu-principal    timeout=5s

Navegar Para Lista de Tarefas
    Go To    ${BASE_URL}/tarefas
    Wait Until Element Is Visible    css=.lista-tarefas    timeout=5s

Clicar em Excluir Tarefa
    [Arguments]    ${id}
    Click Element    css=[data-tarefa-id="${id}"] .btn-excluir
    Wait Until Element Is Visible    id=modal-confirmacao    timeout=5s

Confirmar Exclusão no Modal
    Click Button    id=btn-confirmar-exclusao
    Sleep    1s

Cancelar Exclusão no Modal
    Click Button    id=btn-cancelar-exclusao
    Sleep    1s

Verificar Que Tarefa Foi Removida
    [Arguments]    ${id}
    Element Should Not Be Visible    css=[data-tarefa-id="${id}"]

Verificar Que Tarefa Ainda Existe
    [Arguments]    ${id}
    Element Should Be Visible    css=[data-tarefa-id="${id}"]

Verificar Que Botão Excluir Não Existe
    Element Should Not Be Visible    css=.btn-excluir

Verificar Mensagem de Sucesso
    [Arguments]    ${mensagem}
    Wait Until Page Contains    ${mensagem}    timeout=5s
