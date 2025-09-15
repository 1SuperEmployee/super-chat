class MissionControlController < ApplicationController
  before_action :require_user

  def show
    @page_title = "Mission Control"
  end
end


