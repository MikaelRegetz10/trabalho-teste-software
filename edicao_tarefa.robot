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
${TAREFA_ID}      12

*** Test Cases ***
CT01 - Edição com dados válidos pelo criador
    [Documentation]    Criador edita tarefa com título válido e salva com sucesso
    Fazer Login    ${EMAIL_CRIADOR}    ${SENHA_CRIADOR}
    Acessar Edição de Tarefa    ${TAREFA_ID}
    Limpar Campo e Digitar    id=campo-titulo    Dar remédio às 14h - atualizado
    Clicar em Salvar
    Verificar Mensagem de Sucesso    Tarefa atualizada com sucesso

CT02 - Erro ao tentar salvar sem título
    [Documentation]    Sistema deve exibir erro ao tentar salvar tarefa sem título
    Fazer Login    ${EMAIL_CRIADOR}    ${SENHA_CRIADOR}
    Acessar Edição de Tarefa    ${TAREFA_ID}
    Limpar Campo e Digitar    id=campo-titulo    ${EMPTY}
    Clicar em Salvar
    Verificar Mensagem de Erro    Título obrigatório

CT03 - Membro sem permissão não vê botão de editar (RN08)
    [Documentation]    Usuário sem permissão não deve ter acesso à edição
    Fazer Login    ${EMAIL_MEMBRO}    ${SENHA_MEMBRO}
    Navegar Para    ${BASE_URL}/tarefas
    Verificar Que Elemento Não Existe    css=button.editar-tarefa

CT04 - Usuário não autenticado é redirecionado ao login
    [Documentation]    Acesso sem autenticação deve redirecionar ao login
    Abrir URL Sem Autenticação    ${BASE_URL}/tarefas/${TAREFA_ID}/editar
    Verificar URL Atual Contém    /login

CT05 - Admin do grupo edita tarefa de outro membro
    [Documentation]    Admin deve conseguir editar qualquer tarefa do grupo (RN08)
    Fazer Login    admin@teste.com    adminsenha
    Acessar Edição de Tarefa    ${TAREFA_ID}
    Limpar Campo e Digitar    id=campo-titulo    Tarefa editada pelo admin
    Clicar em Salvar
    Verificar Mensagem de Sucesso    Tarefa atualizada com sucesso

*** Keywords ***
Fazer Login
    [Arguments]    ${email}    ${senha}
    Go To    ${BASE_URL}/login
    Input Text    id=campo-email    ${email}
    Input Text    id=campo-senha    ${senha}
    Click Button    id=btn-entrar
    Wait Until Element Is Visible    id=menu-principal    timeout=5s

Acessar Edição de Tarefa
    [Arguments]    ${id}
    Go To    ${BASE_URL}/tarefas/${id}/editar
    Wait Until Element Is Visible    id=campo-titulo    timeout=5s

Limpar Campo e Digitar
    [Arguments]    ${locator}    ${texto}
    Clear Element Text    ${locator}
    Run Keyword If    '${texto}' != '${EMPTY}'    Input Text    ${locator}    ${texto}

Clicar em Salvar
    Click Button    id=btn-salvar-tarefa
    Sleep    1s

Verificar Mensagem de Sucesso
    [Arguments]    ${mensagem}
    Wait Until Page Contains    ${mensagem}    timeout=5s

Verificar Mensagem de Erro
    [Arguments]    ${mensagem}
    Wait Until Page Contains    ${mensagem}    timeout=5s

Verificar Que Elemento Não Existe
    [Arguments]    ${locator}
    Element Should Not Be Visible    ${locator}

Abrir URL Sem Autenticação
    [Arguments]    ${url}
    Delete All Cookies
    Go To    ${url}

Verificar URL Atual Contém
    [Arguments]    ${fragmento}
    ${url_atual}=    Get Location
    Should Contain    ${url_atual}    ${fragmento}

Navegar Para
    [Arguments]    ${url}
    Go To    ${url}
    Sleep    1s
