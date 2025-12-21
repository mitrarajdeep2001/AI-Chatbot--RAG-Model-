import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    return { status: 'OK', mode: fastify.config.NODE_ENV }
  })
}

export default root
