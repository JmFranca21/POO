import { Bicicleta } from "./bicicleta"
import { Estacao } from "./estacao"
import { Tarifa } from "./tarifa"
import { Usuario } from "./usuario"

export class Viagem {
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