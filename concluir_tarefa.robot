*** Settings ***
Library    SeleniumLibrary

Suite Setup       Dado que o usuário está autenticado e acessa a tarefa pendente
Suite Teardown    E fecha o navegador

*** Variables ***
${URL_LOGIN}               http://localhost:3000/login
${URL_TAREFA}              http://localhost:3000/tarefas/tarefa01
${URL_TAREFA_CONCLUIDA}    http://localhost:3000/tarefas/tarefa_concluida
${BROWSER}                 chrome

${INPUT_EMAIL}         id=email
${INPUT_SENHA}         id=senha
${BOTAO_LOGIN}         id=btnEntrar
${BOTAO_CONCLUIR}      id=btnConcluir
${STATUS_TAREFA}       id=statusTarefa
${MENSAGEM}            id=mensagem

*** Test Cases ***
CT01 - Deve marcar tarefa pendente como concluída
    Quando o usuário clica em Marcar como Concluída
    Então o status da tarefa deve ser    Concluída
    E o sistema deve apresentar a mensagem    Tarefa marcada como concluída

CT02 - Botão de conclusão deve estar indisponível para tarefa já concluída
    Dado que o usuário acessa uma tarefa já concluída
    Então o botão Marcar como Concluída não deve estar disponível

*** Keywords ***
Dado que o usuário está autenticado e acessa a tarefa pendente
    Open Browser    ${URL_LOGIN}    ${BROWSER}
    Maximize Browser Window
    Input Text        ${INPUT_EMAIL}    maria@email.com
    Input Password    ${INPUT_SENHA}    senha123
    Click Button      ${BOTAO_LOGIN}
    Go To    ${URL_TAREFA}

Quando o usuário clica em Marcar como Concluída
    Click Button    ${BOTAO_CONCLUIR}

Então o status da tarefa deve ser
    [Arguments]    ${status}
    Element Text Should Be    ${STATUS_TAREFA}    ${status}

E o sistema deve apresentar a mensagem
    [Arguments]    ${mensagem}
    Element Text Should Be    ${MENSAGEM}    ${mensagem}

Dado que o usuário acessa uma tarefa já concluída
    Go To    ${URL_TAREFA_CONCLUIDA}

Então o botão Marcar como Concluída não deve estar disponível
    Element Should Not Be Visible    ${BOTAO_CONCLUIR}

E fecha o navegador
    Close Browser
