function dinheiro(n: number) {
  return Math.round(n * 100) / 100
}

type StatusBicicleta =
  | 'Disponível'
  | 'EmUso'
  | 'Manutenção'

class Usuario {
  constructor(
    public readonly id: string,
    public nome: string
  ) {}
}

class Bicicleta {
  status: StatusBicicleta = 'Disponível'
  estacao: Estacao | null = null

  constructor(
    public readonly id: string,
    public tipo: 'comum' | 'eletrica' = 'comum'
  ) {}

  atrelarA(estacao: Estacao) {
    if (this.status === 'EmUso') {
      throw Error('Não é possível atracar bicicleta em uso')
    }
    this.estacao = estacao
    this.status = 'Disponível'
  }

  desatrelar() {
    if (this.status !== 'Disponível') {
      throw Error('Não é possível destracar em uso')
    }
    this.estacao = null
  }

  iniciarUso() {
    if (this.status !== 'Disponível' || !this.estacao) {
      throw Error('Bicicleta não está pronta')
    }
    this.status = 'EmUso'
    this.estacao = null
  }

  finalizarUsoEm(estacao: Estacao) {
    if(this.status !== 'EmUso') {
      throw Error('Bicicleta não está em uso')
    }
    this.status = 'Disponível'
    estacao.atracar(this)
  }
}

class Estacao {
  bicicletas: Set<Bicicleta> = new Set()

  constructor(
    public readonly id: string,
    public capacidade: number,
    public sobrecarga = false
  ) {}

  temEspaco() {
    return this.bicicletas.size < this.capacidade
  } 

  atracar(bicicleta: Bicicleta) {
    if(!this.temEspaco) {
      throw Error('Sem espaço para atracar')
    }

    if(bicicleta.status === 'EmUso') {
      throw Error('Não é possível atracar bicicleta em uso')
    }

    if(bicicleta.estacao && bicicleta.estacao !== this) {
      bicicleta.estacao.desatracar(bicicleta)
    }

    this.bicicletas.add(bicicleta)
    bicicleta.atrelarA(this)
  }

  desatracar(bicicleta: Bicicleta) {
    if (!this.bicicletas.has(bicicleta)) {
      throw Error('Bicicleta não está nesta estação')
    }

    this.bicicletas.delete(bicicleta)
    bicicleta.desatrelar()
  }

  quantidadeDeBicicletas() {
    return this.bicicletas.size
  }
}

class Tarifa {
  constructor(
    public minutos: number,
    public total: number) {}
}

class Viagem {
  estado: 'Rascunho' | 'Ativa' | 'Concluída' = 'Rascunho'
  inicio?: Date
  fim?: Date
  bicicleta?: Bicicleta
  tarifa?: Tarifa

  constructor(
    public readonly id: string,
    public readonly usuario: Usuario,
    public origem: Estacao,
    public destino?: Estacao
  ) {}

  iniciar(bicicleta: Bicicleta, em: Date) {
    if (this.estado !== 'Rascunho') {
      throw Error('Viagem já iniciada')
    }

    this.bicicleta = bicicleta
    this.inicio = em
    this.estado = 'Ativa'
  }

  concluir(em: Date, tarifa: Tarifa, destino: Estacao) {
    if (this.estado !== 'Ativa') {
      throw Error('Viagem não está ativa')
    }

    this.fim = em
    this.tarifa = tarifa
    this.destino = destino
    this.estado = 'Concluída'
  }

  duracaoMinutos(agora: Date): number {
    if (!this.inicio) return 0
    const fim = this.fim ?? agora
    return Math.max(0, Math.ceil(fim.getTime() - this.inicio.getTime()) / 60000)
  }
}

class GerenciadorViagens {
  constructor(
    public usuarios: Map<string, Usuario>,
    public bicicletas: Map<string, Bicicleta>,
    public estacoes: Map<string, Estacao>,
    public viagens: Map<string, Viagem>,
  ) {}

  iniciarViagem(
    usuarioId: string,
    bicicleta: Bicicleta,
    origem: Estacao,
    agora: Date = new Date()) {
      const usuario = this.usuarios.get(usuarioId)
      if (!usuario) {
        throw new Error('Usuário não encontrado')
      }
      origem.desatracar(bicicleta)
      bicicleta.iniciarUso()

      const viagem = new Viagem(
        `${usuarioId}-${agora}`,
        usuario,
        origem
      )

      viagem.iniciar(bicicleta, agora)
      this.viagens.set(viagem.id, viagem)
      return viagem
    }

    concluirViagem(
      usuarioId: string,
      destino: Estacao,
      agora: Date = new Date()) {
      const viagem = Array.from(this.viagens.values()).find(
        (v) => v.usuario.id === usuarioId && v.estado === 'Ativa'
      )
      if (!viagem) {
        throw Error('Nenhuma viagem ativa para este usuário')
      }
      if(!destino.temEspaco) {
        throw Error('Sem espaço na estação de destino')
      }

      const bicicleta = viagem.bicicleta!

      const minutos = viagem.duracaoMinutos(agora)
      const minutosPagos = Math.max(0, minutos - 3)
      const precoPorMin = bicicleta.tipo === 'eletrica' ? 0.35 : 0.25
      const multSobrecarga = destino.sobrecarga ? 1.5 : 1.0
      const total = dinheiro(minutosPagos * precoPorMin * multSobrecarga)

      const tarifa = new Tarifa(minutos, total)
      bicicleta.finalizarUsoEm(destino)
      viagem.concluir(agora, tarifa, destino)

      console.log('Minutos', minutos, 'Cobrança: R$' + total.toFixed(2))
    }
}