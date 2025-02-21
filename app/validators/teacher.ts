import vine from '@vinejs/vine'

export const createTeacherValidator = vine.compile(
  vine.object({
    user_id: vine.number().exists({ table: 'users', column: 'id' }),
    name: vine.string().minLength(4),
    nip: vine.string().minLength(4),
    phone: vine.string().minLength(11).maxLength(13),
    address: vine.string().minLength(4),
    profile_picture: vine.string().minLength(4),
  })
)
