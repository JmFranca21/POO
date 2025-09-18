Implemente um mini-sistema de biblioteca com as classes:

- Livro: obra (título, autor, editora, gênero, ano).
- Exemplar: cópia concreta de um Livro (id do exemplar, livro, status).
- Usuario: pessoa que toma emprestado (id, nome).
- Emprestimo: registro do empréstimo (usuário, exemplar, datas, estado).
- Biblioteca (ou GerenciadorEmprestimos): coordena os empréstimos/devoluções.


Regras
- Um exemplar pode estar Disponivel, Emprestado ou Danificado
- Um usuario pode ter no máximo três livros emprestados de uma vez
- Empréstimo dura 14 dias; não precisa calcular multa (por enquanto)
- Não é possível emprestar um exemplar que não esteja Disponivel.
- Ao devolver, o exemplar volta a ficar Disponivel e o Emprestimo muda para Concluido.

Implemente:
Biblioteca.emprestar(usuario, exemplar, dataInicio)
Biblioteca.devolver(usuario, exemplar, dataDevolucao)
Emprestimo.diasAtraso(hoje) (retorna 0 se dentro do prazo)
Casos de teste (manuais)
Emprestar 1 exemplar e devolver dentro do prazo (sem atraso).
Tentar emprestar exemplar já emprestado → lançar erro.
Tentar emprestar 4º livro para o mesmo usuário → lançar erro.
Devolver após 20 dias → diasAtraso deve ser 6.