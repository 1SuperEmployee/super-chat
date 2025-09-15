class LibraryController < ApplicationController
  before_action :require_user

  def index
    @page_title = "Library"
  end
end


