import { Estacao } from "./estacao"

type StatusBicicleta =
  | 'Disponível'
  | 'EmUso'
  | 'Manutenção'

export class Bicicleta {
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
    console.log('Estação da bicicleta: ', this.estacao)
    if (this.status !== 'Disponível') {
      throw Error('Bicicleta não está pronta')
    }
    this.status = 'EmUso'
  }

  finalizarUsoEm(estacao: Estacao) {
    if(this.status !== 'EmUso') {
      throw Error('Bicicleta não está em uso')
    }
    this.status = 'Disponível'
    estacao.atracar(this)
  }
}