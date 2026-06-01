*** Settings ***
Documentation       Testes de Interface de Usuário — VoLembrar
...                 Cobre: Criação de Tarefa (CT-UI-01 a CT-UI-06) e
...                 Atualização de Status (CT-UI-07 a CT-UI-11)
Library             SeleniumLibrary
Suite Setup         Abrir Navegador
Suite Teardown      Fechar Navegador

*** Variables ***
${URL_BASE}         http://localhost:3000
${BROWSER}          chrome
${EMAIL_VALIDO}     carlos@email.com
${SENHA_VALIDA}     senhaSegura123
${NOME_GRUPO}       Família Silva
${TITULO_TAREFA}    Dar remédio de pressão
${DESC_TAREFA}      1 comprimido de Losartana 50mg com água.
${DATA_TAREFA}      2026-06-15T08:00

*** Keywords ***
Abrir Navegador
    Open Browser    ${URL_BASE}    ${BROWSER}
    Maximize Browser Window

Fechar Navegador
    Close All Browsers

Fazer Login
    [Arguments]    ${email}    ${senha}
    Go To    ${URL_BASE}/login
    Wait Until Element Is Visible    id=email    timeout=10s
    Input Text    id=email    ${email}
    Input Text    id=senha    ${senha}
    Click Button    xpath=//button[contains(text(),'Entrar')]
    Wait Until Element Is Visible    xpath=//h1[contains(text(),'Dashboard') or contains(text(),'Grupos')]    timeout=10s

Acessar Grupo
    [Arguments]    ${nome_grupo}
    Click Element    xpath=//div[contains(text(),'${nome_grupo}') or contains(@class,'grupo-card') and contains(text(),'${nome_grupo}')]
    Wait Until Element Is Visible    xpath=//h2[contains(text(),'${nome_grupo}')] | //div[contains(@class,'grupo-header')]    timeout=10s

Clicar Em Nova Tarefa
    Click Button    xpath=//button[contains(text(),'Nova Tarefa') or contains(text(),'+ Tarefa')]
    Wait Until Element Is Visible    xpath=//form[contains(@class,'tarefa-form')] | //div[contains(@class,'modal')]    timeout=10s

Preencher Formulario De Tarefa
    [Arguments]    ${titulo}    ${descricao}=${EMPTY}    ${data_hora}=${DATA_TAREFA}    ${critica}=False    ${antecedencia}=${EMPTY}
    Input Text    id=titulo    ${titulo}
    Run Keyword If    '${descricao}' != '${EMPTY}'    Input Text    id=descricao    ${descricao}
    Input Text    id=data_hora_execucao    ${data_hora}
    Run Keyword If    '${critica}' == 'True'    Select Checkbox    id=e_critica
    Run Keyword If    '${antecedencia}' != '${EMPTY}'    Input Text    id=antecedencia_min    ${antecedencia}

Salvar Tarefa
    Click Button    xpath=//button[contains(text(),'Salvar') or contains(text(),'Criar Tarefa')]

Verificar Mensagem De Sucesso
    Wait Until Element Is Visible    xpath=//*[contains(text(),'sucesso') or contains(text(),'criada') or contains(@class,'alert-success')]    timeout=10s

Verificar Mensagem De Erro
    [Arguments]    ${mensagem}
    Wait Until Element Is Visible    xpath=//*[contains(text(),'${mensagem}') or contains(@class,'alert-error') or contains(@class,'field-error')]    timeout=10s

Verificar Tarefa Na Lista
    [Arguments]    ${titulo}
    Wait Until Element Is Visible    xpath=//*[contains(text(),'${titulo}')]    timeout=10s

Verificar Tarefa Critica Destacada
    [Arguments]    ${titulo}
    Element Should Be Visible    xpath=//*[contains(text(),'${titulo}')]/ancestor::*[contains(@class,'tarefa-critica') or contains(@class,'critical') or contains(@style,'red') or contains(@class,'badge-danger')]

*** Test Cases ***

# ==========================================
# TESTE 1 — CRIAÇÃO DE TAREFA
# ==========================================

CT-UI-01 Login Com Credenciais Válidas
    [Documentation]    Verifica que o usuário consegue fazer login e é redirecionado ao dashboard
    [Tags]    login    smoke
    Fazer Login    ${EMAIL_VALIDO}    ${SENHA_VALIDA}
    Page Should Contain Element    xpath=//span[contains(@class,'user-name')] | //p[contains(@class,'welcome')]
    Page Should Not Contain    xpath=//div[contains(@class,'login-form')]

CT-UI-02 Acesso ao Grupo e Exibição da Lista de Tarefas
    [Documentation]    Verifica que ao acessar o grupo a lista de tarefas é exibida
    [Tags]    navegacao    grupo
    Fazer Login    ${EMAIL_VALIDO}    ${SENHA_VALIDA}
    Acessar Grupo    ${NOME_GRUPO}
    Page Should Contain Element    xpath=//div[contains(@class,'lista-tarefas') or contains(@class,'task-list')]
    Page Should Contain Element    xpath=//h2[contains(text(),'${NOME_GRUPO}')]

CT-UI-03 Criar Tarefa Com Todos os Campos Válidos
    [Documentation]    Cria uma tarefa com todos os campos obrigatórios e opcionais preenchidos corretamente
    [Tags]    tarefa    criacao    smoke
    Fazer Login    ${EMAIL_VALIDO}    ${SENHA_VALIDA}
    Acessar Grupo    ${NOME_GRUPO}
    Clicar Em Nova Tarefa
    Preencher Formulario De Tarefa
    ...    titulo=${TITULO_TAREFA}
    ...    descricao=${DESC_TAREFA}
    ...    data_hora=${DATA_TAREFA}
    ...    critica=True
    ...    antecedencia=15
    Salvar Tarefa
    Verificar Mensagem De Sucesso
    Verificar Tarefa Na Lista    ${TITULO_TAREFA}

CT-UI-04 Criar Tarefa Sem Título Exibe Mensagem de Erro
    [Documentation]    Tenta criar uma tarefa sem preencher o campo obrigatório Título
    [Tags]    tarefa    validacao    negativo
    Fazer Login    ${EMAIL_VALIDO}    ${SENHA_VALIDA}
    Acessar Grupo    ${NOME_GRUPO}
    Clicar Em Nova Tarefa
    Preencher Formulario De Tarefa
    ...    titulo=${EMPTY}
    ...    data_hora=${DATA_TAREFA}
    ...    critica=False
    Salvar Tarefa
    Verificar Mensagem De Erro    Título é obrigatório
    Page Should Not Contain Element    xpath=//*[contains(@class,'alert-success')]

CT-UI-05 Criar Tarefa Sem Data Hora Exibe Mensagem de Erro
    [Documentation]    Tenta criar uma tarefa sem informar a data e hora de execução
    [Tags]    tarefa    validacao    negativo
    Fazer Login    ${EMAIL_VALIDO}    ${SENHA_VALIDA}
    Acessar Grupo    ${NOME_GRUPO}
    Clicar Em Nova Tarefa
    Input Text    id=titulo    Tarefa sem data
    Salvar Tarefa
    Verificar Mensagem De Erro    obrigatório

CT-UI-06 Verificar Indicador Visual de Tarefa Crítica na Lista
    [Documentation]    Verifica se tarefas críticas são destacadas visualmente na lista
    [Tags]    tarefa    ui    visual
    Fazer Login    ${EMAIL_VALIDO}    ${SENHA_VALIDA}
    Acessar Grupo    ${NOME_GRUPO}
    Verificar Tarefa Critica Destacada    ${TITULO_TAREFA}

# ==========================================
# TESTE 2 — ATUALIZAÇÃO DE STATUS
# ==========================================

CT-UI-07 Acesso à Lista de Tarefas Pendentes
    [Documentation]    Verifica que as tarefas pendentes estão listadas ao acessar o grupo
    [Tags]    status    listagem
    Fazer Login    ${EMAIL_VALIDO}    ${SENHA_VALIDA}
    Acessar Grupo    ${NOME_GRUPO}
    Page Should Contain Element    xpath=//*[contains(text(),'pendente') or contains(@class,'status-pendente')]

CT-UI-08 Abrir Detalhes de Uma Tarefa Existente
    [Documentation]    Verifica que ao clicar em uma tarefa suas informações completas são exibidas
    [Tags]    status    detalhes
    Fazer Login    ${EMAIL_VALIDO}    ${SENHA_VALIDA}
    Acessar Grupo    ${NOME_GRUPO}
    Click Element    xpath=//*[contains(text(),'${TITULO_TAREFA}')]
    Wait Until Element Is Visible    xpath=//div[contains(@class,'tarefa-detalhes') or contains(@class,'task-detail')]    timeout=10s
    Page Should Contain    ${TITULO_TAREFA}
    Page Should Contain Element    xpath=//*[contains(text(),'Marcar como Concluída') or contains(text(),'Concluir')]

CT-UI-09 Marcar Tarefa Como Concluída
    [Documentation]    Verifica que o status da tarefa é atualizado para concluída com feedback visual
    [Tags]    status    atualizacao    smoke
    Fazer Login    ${EMAIL_VALIDO}    ${SENHA_VALIDA}
    Acessar Grupo    ${NOME_GRUPO}
    Click Element    xpath=//*[contains(text(),'${TITULO_TAREFA}')]
    Wait Until Element Is Visible    xpath=//button[contains(text(),'Marcar como Concluída') or contains(text(),'Concluir')]    timeout=10s
    Click Button    xpath=//button[contains(text(),'Marcar como Concluída') or contains(text(),'Concluir')]
    Wait Until Element Is Visible    xpath=//*[contains(text(),'concluída') or contains(@class,'status-concluida')]    timeout=10s

CT-UI-10 Tarefa Concluída Aparece no Histórico
    [Documentation]    Verifica que a tarefa concluída é listada na página de histórico do grupo
    [Tags]    status    historico
    Fazer Login    ${EMAIL_VALIDO}    ${SENHA_VALIDA}
    Acessar Grupo    ${NOME_GRUPO}
    Click Element    xpath=//a[contains(text(),'Histórico') or contains(@href,'historico')]
    Wait Until Element Is Visible    xpath=//div[contains(@class,'historico') or contains(@class,'history-list')]    timeout=10s
    Verificar Tarefa Na Lista    ${TITULO_TAREFA}

CT-UI-11 Botão de Conclusão Indisponível em Tarefa Já Concluída
    [Documentation]    Verifica que o botão Marcar como Concluída está desabilitado ou oculto em tarefa já concluída
    [Tags]    status    validacao    negativo
    Fazer Login    ${EMAIL_VALIDO}    ${SENHA_VALIDA}
    Acessar Grupo    ${NOME_GRUPO}
    Click Element    xpath=//*[contains(text(),'${TITULO_TAREFA}')]
    Wait Until Element Is Visible    xpath=//div[contains(@class,'tarefa-detalhes') or contains(@class,'task-detail')]    timeout=10s
    ${botao_visivel}=    Run Keyword And Return Status
    ...    Element Should Be Visible    xpath=//button[contains(text(),'Marcar como Concluída')]
    Run Keyword If    ${botao_visivel}
    ...    Element Should Be Disabled    xpath=//button[contains(text(),'Marcar como Concluída')]
