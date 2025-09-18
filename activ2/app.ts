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

type StatusExemplar = 
    | 'Disponível'
    | 'Emprestado'
    | 'Danificado'

export class Exemplar {
    constructor (
        public readonly id: string,
        public livro: Livro,
        public status: StatusExemplar
    ) {}

    emprestarA() {
        if (this.status !== 'Disponível') {
            throw new Error('Exemplar indisponível para empréstimo!')
        }
        this.status = 'Emprestado'
    }

    devolvido() {
        if (this.status !== 'Emprestado') {
            throw new Error('Este exemplar não estava registrado como emprestado!')
        }
        this.status = 'Disponível'
    }
}

export class Usuario {
    constructor (
        public readonly id: string,
        public nome: string,
        public emprestimosAtivos: number = 0
    ) {}

    pegarEmprestado() {
        if (this.emprestimosAtivos >= 3) {
            throw new Error('Usuário já atingiu o número máximo de empréstimos!')
        }
        this.emprestimosAtivos++
    }

    devolver() {
        if (this.emprestimosAtivos == 0) {
            throw new Error('Não há empréstimos ativos para esse usuário!')
        }
        this.emprestimosAtivos--
    }
}


export class Emprestimo {
    public dataInicio: Date = new Date();
    public dataFinal: Date = new Date();
    public dataDevolucao?: Date;
    public estado: 'Ativo' | 'Finalizado' = 'Ativo';

    constructor (
        public readonly id: string,
        public usuario: Usuario,
        public exemplar: Exemplar,
    ) {
        this.dataFinal.setDate(this.dataInicio.getDate() + 14)
    }

    finalizar(dataDevolucao: Date) {
        this.dataDevolucao = dataDevolucao

        if (dataDevolucao > this.dataFinal) {
            const diffMs = dataDevolucao.getTime() - this.dataFinal.getTime();
            const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            console.log('Devolução Atrasada!')
            console.log(`Dias de atraso: ${diffDias} dias!`)
        } else {
            console.log('Devolução no prazo!')
        }
    }

    diasAtraso(data: Date) {
        if (data > this.dataFinal) {
            const diffMs = data.getTime() - this.dataFinal.getTime();
            const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            console.log(`Dias de atraso: ${diffDias} dias!`)
        } else {
            return 0
        }
    }
    
}

export class Biblioteca {
    constructor (
        public usuarios: Map<string, Usuario>,
        public livros: Map<string, Livro>,
        public exemplares: Map<string, Exemplar>,
        public emprestimos: Map<string, Emprestimo>
    ) {}

    iniciarEmprestimo(
        usuarioId: string,
        exemplarId: string,
    ): string {
        const usuario = this.usuarios.get(usuarioId)
        if (!usuario) {
            throw new Error('Usuário não encontrado!')
        }

        const exemplar = this.exemplares.get(exemplarId)
        if (!exemplar) {
            throw new Error('Exemplar não encontrado!')
        }
        usuario.pegarEmprestado()
        exemplar.emprestarA()

        const emprestimoId: string = gerarId()
        const emprestimo = new Emprestimo(emprestimoId, usuario, exemplar);
        this.emprestimos.set(emprestimoId, emprestimo)
        return emprestimoId
    }

    registrarDevolucao(
        emprestimoId: string,
        usuarioId: string,
        exemplarId: string,
        dataDevolucao: Date
    ) {
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

        usuario.devolver()
        exemplar.devolvido()
        emprestimo.finalizar(dataDevolucao)
    }
}

// ====== Casos de Teste ======
const usuarios = new Map<string, Usuario>()
const livros = new Map<string, Livro>()
const exemplares = new Map<string, Exemplar>()
const emprestimos = new Map<string, Emprestimo>()

const biblioteca = new Biblioteca(usuarios, livros, exemplares, emprestimos)

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

const exemplar1 = new Exemplar('e1', livro1, 'Disponível')
const exemplar2 = new Exemplar('e2', livro2, 'Disponível')
const exemplar3 = new Exemplar('e3', livro3, 'Disponível')
const exemplar4 = new Exemplar('e4', livro4, 'Disponível')
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

// aqui eu criei dois métodos, onde você pode usar o Emprestimo.diasAtraso(data) apenas para verificar quantos dias esta atrasado,
// ou o Emprestimo.finalizar(data) que define a data de devolução 

// const emprestimoIdAtrasado = biblioteca.iniciarEmprestimo('u1', 'e1');

// // Simula devolução após 20 dias
// const dataDevolucaoAtrasada = new Date();
// dataDevolucaoAtrasada.setDate(dataDevolucaoAtrasada.getDate() + 20);
// const emprestimoAtrasado = emprestimos.get(emprestimoIdAtrasado)

// emprestimoAtrasado?.diasAtraso(dataDevolucaoAtrasada)
// biblioteca.registrarDevolucao(emprestimoIdAtrasado, 'u1', 'e1', dataDevolucaoAtrasada);

