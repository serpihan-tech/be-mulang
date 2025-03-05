export const messages: Record<string, string> = {
  'enum': '{{ field }} harus salah satu dari {{ choices }}',
  'minLength': '{{ field }} harus memiliki panjang minimal {{ min }} karakter',
  'maxLength': '{{ field }} harus memiliki panjang maksimal {{ max }} karakter',
  'date': '{{ field }} harus berupa tanggal',
  'requiredIfExists': '{{ field }} harus diisi',
  'string': '{{ field }} harus berupa teks',
  'required': '{{ field }} harus diisi',
  'email': '{{ field }} harus berupa alamat email yang valid',
  'numeric': '{{ field }} harus berupa angka',
  'unique': '{{ field }} sudah ada',
  'database.exists': '{{ field }} tidak ditemukan',
}
