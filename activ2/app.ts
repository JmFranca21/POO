function gerarId(tamanho: number = 10): string {
    return Math.random().toString(36).substring(2, 2 + tamanho);
}

export class Livro {
    constructor(
        public titulo: string,
        public autor: string,
        public editora: string,
        public ano: string
    ) {}
}

// Cria o tipo que corresponde aos valores possíveis para o status de um exemplar
type StatusExemplar = 
    | 'Disponível'
    | 'Emprestado'
    | 'Danificado'

export class Exemplar {
    // Inicializa novo Exemplar: recebe Id, Livro (obra) correspondente, e o status daquele exemplar (padrão Disponível para novo Exemplar)
    constructor (
        public readonly id: string,
        public livro: Livro,
        public status: StatusExemplar = 'Disponível'
    ) {}

    // Verifica se o status daquele exemplar está como Disponível, caso contrário lança erro pois nao consegue iniciar o empréstimo.
    // Caso esteja Disponível, modifica para Emprestado
    emprestarA() {
        if (this.status !== 'Disponível') {
            throw new Error('Exemplar indisponível para empréstimo!')
        }
        this.status = 'Emprestado'
    }

    // Verifica se o status está como Emprestado, caso contrário não há como devolver um exemplar que não estava emprestado.
    // Caso esteja Emprestado, modifica para Disponível (devolução realizada)
    devolvido() {
        if (this.status !== 'Emprestado') {
            throw new Error('Este exemplar não estava registrado como emprestado!')
        }
        this.status = 'Disponível'
    }
}

export class Usuario {
    public dataBloqueio?: Date;
    // Inicializa um novo objeto de Usuario: recebe id, nome e numero de emprestimosAtivos (padrão como 0 para criação de novo usuário)
    constructor (
        public readonly id: string,
        public nome: string,
        public emprestimosAtivos: number = 0
    ) {}

    // Verifica se o usuário já possui 3 empréstimos ativos, caso tiver não permite a criação de um novo.
    // caso contrário, aumenta o numero de emprestimosAtivos
    pegarEmprestado() {
        if (this.emprestimosAtivos >= 3) {
            throw new Error('Usuário já atingiu o número máximo de empréstimos!')
        }
        this.emprestimosAtivos++
    }

    // Verifica se o usuário possui empréstimos ativos, caso contrário não consegue devolver empréstimo que não existe
    // Se houver, diminui o número de emprestimosAtivos
    devolver() {
        if (this.emprestimosAtivos == 0) {
            throw new Error('Não há empréstimos ativos para esse usuário!')
        }
        this.emprestimosAtivos--
    }

    bloquearUsuario(dias: number) {
        this.dataBloqueio = new Date()
        this.dataBloqueio.setDate(this.dataBloqueio.getDate() + dias)
    }
}


export class Emprestimo {
    public dataInicio: Date = new Date();
    public dataFinal: Date = new Date();
    public dataDevolucao?: Date;
    public estado: 'Ativo' | 'Finalizado' | 'Atrasado' = 'Ativo';

    constructor (
        public readonly id: string,
        public usuario: Usuario,
        public exemplar: Exemplar,
    ) {
        this.dataFinal.setDate(this.dataInicio.getDate() + 14)
    }

    finalizar(usuario: Usuario, dataDevolucao: Date) {
        this.dataDevolucao = dataDevolucao

        if (dataDevolucao > this.dataFinal) {
            console.log('Devolução atrasada!')
            const dias = this.diasAtraso(dataDevolucao)
            usuario.bloquearUsuario(dias)
        } else {
            console.log('Devolução no prazo!')
            this.estado = 'Finalizado'
        }
    }

    diasAtraso(data: Date) {
        if (data > this.dataFinal) {
            const diffMs = data.getTime() - this.dataFinal.getTime();
            const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            console.log(`Dias de atraso: ${diffDias} dias!`)
            this.estado = 'Atrasado'
            return diffDias
        } else {
            return 0
        }
    }
    
}

export class Biblioteca {
    // Inicializa nova biblioteca com os Maps para os objetos de cada classe diferente
    constructor (
        public usuarios: Map<string, Usuario>,
        public livros: Map<string, Livro>,
        public exemplares: Map<string, Exemplar>,
        public emprestimos: Map<string, Emprestimo>,
        public historicoAtrasos: Map<string, Date>, // Recebe o id do emprestimo atrasado e a data do atraso
        public historicoDanificados: Map<string, Date> // Recebe o id do exemplar danificado e a data do dano
    ) {}

    // Método que inicializa um novo empréstimo: recebe ID's de usuario e exemplar.
    // ("Um certo usuário pega um certo exemplar emprestado! => Lógica básica do método")
    iniciarEmprestimo(
        usuarioId: string,
        exemplarId: string,
    ): string {
        // Tenta encontrar usuario e exemplar por meio dos Id's nos Maps, caso não encontre algum dos dois lança Erro.
        const usuario = this.usuarios.get(usuarioId)
        if (!usuario) {
            throw new Error('Usuário não encontrado!')
        }

        const exemplar = this.exemplares.get(exemplarId)
        if (!exemplar) {
            throw new Error('Exemplar não encontrado!')
        }
        const hoje: Date = new Date()
        const bloqueado = this.estaBloqueado(usuario, hoje)
        if (bloqueado) {
            throw new Error('O usuário está bloqueado!')
        }

        // Caso encontre ambos e nao esteja bloqueado, chama os métodos usuario.PegarEmprestado() e exemplar.emprestarA()
        usuario.pegarEmprestado()
        exemplar.emprestarA()

        // Chama a função para criar um ID aleatório para um novo Empréstimo
        // Cria um novo registro de empréstimo com as informações de usuario e exemplar
        // Adiciona o emprestimo no Map de empréstimos
        // Retorna o ID gerado para aquele empréstimo
        const emprestimoId: string = gerarId()
        const emprestimo = new Emprestimo(emprestimoId, usuario, exemplar);
        this.emprestimos.set(emprestimoId, emprestimo)
        return emprestimoId
    }

    // ("Um certo usuário realiza a devolução de um certo exemplar em determinada data! => Lógica básica do método")
    registrarDevolucao(
        emprestimoId: string,
        usuarioId: string,
        exemplarId: string,
        dataDevolucao: Date
    ) {
        // Tenta encontrar usuario, exemplar e empréstimo por meio dos Id's nos Maps, caso não encontre algum deles lança Erro.
        const usuario = this.usuarios.get(usuarioId)
        if (!usuario) {
            throw new Error('Usuário não encontrado!')
        }

        const exemplar = this.exemplares.get(exemplarId)
        if (!exemplar) {
            throw new Error('Exemplar não encontrado!')
        }

        const emprestimo = this.emprestimos.get(emprestimoId)
        if (!emprestimo) {
            throw new Error('Empréstimo não encontrado!')
        }

        // Caso encontre todos, chama os métodos de cada classe
        usuario.devolver()
        exemplar.devolvido()
        emprestimo.finalizar(usuario, dataDevolucao)

        if (emprestimo.estado === 'Atrasado') {
            this.historicoAtrasos.set(emprestimoId, dataDevolucao)
        }
    }

    // ("Um certo usuário realiza a devolução de um certo exemplar DANIFICADO em determinada data!")
    registrarDevolucaoDanificada(
        emprestimoId: string,
        usuarioId: string,
        exemplarId: string,
        dataDevolucao: Date
    ) {
        // Tenta encontrar usuario, exemplar e empréstimo
        const usuario = this.usuarios.get(usuarioId)
        if (!usuario) {
            throw new Error('Usuário não encontrado!')
        }

        const exemplar = this.exemplares.get(exemplarId)
        if (!exemplar) {
            throw new Error('Exemplar não encontrado!')
        }

        const emprestimo = this.emprestimos.get(emprestimoId)
        if (!emprestimo) {
            throw new Error('Empréstimo não encontrado!')
        }

        // Atualiza dados do usuário e empréstimo
        usuario.devolver()
        emprestimo.finalizar(usuario, dataDevolucao)

        // Marca o exemplar como danificado
        exemplar.status = 'Danificado'

        // Registra no histórico de danificados
        this.historicoDanificados.set(exemplarId, dataDevolucao)

        console.log(`Exemplar ${exemplarId} devolvido como DANIFICADO!`)
    }


    estaBloqueado(usuario: Usuario, hoje: Date) {
        if (!usuario.dataBloqueio) {
            return false
        }
        return hoje < usuario.dataBloqueio
    }

    exibirHistoricoAtrasos() {
        console.log("=== Histórico de Atrasos ===");
        if (this.historicoAtrasos.size === 0) {
            console.log('Nenhum atraso registrado.')
            return;
        }

        this.historicoAtrasos.forEach((data, emprestimoId) => {
            console.log(`Emprestimo ID: ${emprestimoId} | Data de devolução: ${data.toLocaleDateString()}`)
        })
    }
}

// ====== Casos de Teste ======
const usuarios = new Map<string, Usuario>()
const livros = new Map<string, Livro>()
const exemplares = new Map<string, Exemplar>()
const emprestimos = new Map<string, Emprestimo>()
const historicoAtrasos = new Map<string, Date>()
const historicoDanificados = new Map<string, Date>()

const biblioteca = new Biblioteca(usuarios, livros, exemplares, emprestimos, historicoAtrasos, historicoDanificados)

// Criando usuário e livros
const usuario = new Usuario('u1', 'João')
usuarios.set(usuario.id, usuario)

const usuario2 = new Usuario('u2', 'Maria')
usuarios.set(usuario2.id, usuario2)

const livro1 = new Livro('Livro 1', 'Autor 1', 'Editora 1', '2020')
const livro2 = new Livro('Livro 2', 'Autor 2', 'Editora 2', '2021')
const livro3 = new Livro('Livro 3', 'Autor 3', 'Editora 3', '2022')
const livro4 = new Livro('Livro 4', 'Autor 4', 'Editora 4', '2023')
livros.set('l1', livro1)
livros.set('l2', livro2)
livros.set('l3', livro3)
livros.set('l4', livro4)

const exemplar1 = new Exemplar('e1', livro1)
const exemplar2 = new Exemplar('e2', livro2)
const exemplar3 = new Exemplar('e3', livro3)
const exemplar4 = new Exemplar('e4', livro4)
exemplares.set(exemplar1.id, exemplar1)
exemplares.set(exemplar2.id, exemplar2)
exemplares.set(exemplar3.id, exemplar3)
exemplares.set(exemplar4.id, exemplar4)

// Caso 1: emprestar 1 exemplar e devolver dentro do prazo
// const emprestimo1 = biblioteca.iniciarEmprestimo('u1', 'e1');
// biblioteca.registrarDevolucao(emprestimo1, 'u1', 'e1', new Date())

// Caso 2: tentar emprestar exemplar já emprestado -> lançar erro
// biblioteca.iniciarEmprestimo('u1', 'e1');

// biblioteca.iniciarEmprestimo('u2', 'e1');

// Caso 3: tentar emprestar 4° livro para o mesmo usuário -> lançar erro
// biblioteca.iniciarEmprestimo('u1', 'e1');
// biblioteca.iniciarEmprestimo('u1', 'e2');
// biblioteca.iniciarEmprestimo('u1', 'e3');
// biblioteca.iniciarEmprestimo('u1', 'e4');

// Caso 4: devolver após 20 dias -> diasAtraso deve ser 6

// const emprestimoIdAtrasado = biblioteca.iniciarEmprestimo('u1', 'e1');

// // Simula devolução após 20 dias
// const dataDevolucaoAtrasada = new Date();
// dataDevolucaoAtrasada.setDate(dataDevolucaoAtrasada.getDate() + 20);
// const emprestimoAtrasado = emprestimos.get(emprestimoIdAtrasado)

// emprestimoAtrasado?.diasAtraso(dataDevolucaoAtrasada)
// biblioteca.registrarDevolucao(emprestimoIdAtrasado, 'u1', 'e1', dataDevolucaoAtrasada);

// // Caso 5: devolver com 5 dias de atraso → usuário fica bloqueado por 5 dias
// const emprestimoIdComAtraso5 = biblioteca.iniciarEmprestimo('u1', 'e1');

// // Simula devolução após 19 dias (14 do prazo + 5 de atraso)
// const dataDevolucaoComAtraso5 = new Date();
// dataDevolucaoComAtraso5.setDate(dataDevolucaoComAtraso5.getDate() + 19);

// // Registrar devolução (deveria bloquear o usuário por 5 dias)
// biblioteca.registrarDevolucao(emprestimoIdComAtraso5, 'u1', 'e1', dataDevolucaoComAtraso5);

// // Verificação: usuário deve estar bloqueado
// const usuarioBloqueado = usuarios.get('u1');
// console.log("Usuário bloqueado até:", usuarioBloqueado?.dataBloqueio);

// // Caso 6: usuário bloqueado tentar emprestar antes do fim do bloqueio → deve lançar erro
// try {
//     biblioteca.iniciarEmprestimo('u1', 'e2');
// } catch (e) {
//     console.error("Erro esperado (usuário bloqueado):", (e as Error).message);
// }

// // Caso 7: usuário tenta emprestar DEPOIS do fim do bloqueio → deve conseguir
// if (usuarioBloqueado) {
//     // Simula o tempo passando: desbloqueio já ocorreu (2 dias atrás)
//     usuarioBloqueado.dataBloqueio = new Date();
//     usuarioBloqueado.dataBloqueio.setDate(usuarioBloqueado.dataBloqueio.getDate() - 2);

//     try {
//         const emprestimoPosBloqueio = biblioteca.iniciarEmprestimo('u1', 'e3');
//         console.log("Empréstimo após desbloqueio bem-sucedido! ID:", emprestimoPosBloqueio);
//     } catch (e) {
//         console.error("Erro inesperado:", (e as Error).message);
//     }
// }

// Caso 8: devolver exemplar danificado
const emprestimoDanificado = biblioteca.iniciarEmprestimo('u2', 'e4');
const dataDevolucaoDanificada = new Date();
biblioteca.registrarDevolucaoDanificada(emprestimoDanificado, 'u2', 'e4', dataDevolucaoDanificada);

// Verificando status do exemplar e histórico
console.log("Status do exemplar e4:", exemplares.get('e4')?.status);
console.log("Histórico de danificados:", historicoDanificados);


// Exibe histórico de atrasos
biblioteca.exibirHistoricoAtrasos();

