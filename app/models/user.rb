class User < ApplicationRecord
    validates :email, uniqueness: true
    has_secure_password
    has_many :ivr_studios
    has_one :sw_api_key
    has_many :contacts
    has_many :ivr_studios
    has_many :conversations
end
