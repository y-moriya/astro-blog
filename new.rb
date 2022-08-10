require 'date'
require 'nokogiri'
require 'open-uri'

teams = {
  "阪神" => "T",
  "巨人" => "G",
  "中日" => "D",
  "広島" => "C",
  "ヤクルト" => "S",
  "DeNA" => "DB",
  "ソフトバンク" => "H",
  "ロッテ" => "M",
  "日本ハム" => "F",
  "西武" => "L",
  "オリックス" => "Bs",
  "楽天" => "E",
}

url = "https://baseball.yahoo.co.jp/npb/"
charset = nil
html = URI.open(url) do |f|
  charset = f.charset
  f.read
end
page = Nokogiri::HTML.parse(html, nil, charset)
contents = page.search('.bb-score__content')
game = contents.select{|c| /阪神/.match(c)}[0]

if !game
  puts "今日は試合がありません。"
  return
end

href = game[:href]
home = game.search('.bb-score__homeLogo').text
away = game.search('.bb-score__awayLogo').text
home_score = game.search('.bb-score__score--left').text
away_score = game.search('.bb-score__score--right').text
link_text = game.search('.bb-score__link').text

if link_text != "試合終了"
  puts "まだ試合が終わっていません。"
  return
end

now = DateTime.now
datestr = now.strftime("%Y-%m-%d")
titledate = now.strftime("%Y/%m/%d")
openstr = now < DateTime.parse('2022/03/24') ? '（オープン戦）' : ''
title = %Q(#{titledate} #{home}VS#{away}#{openstr}　#阪神タイガース)
og_title = %Q(#{home} #{home_score} - #{away_score} #{away})
h2 = %Q(## #{home} #{home_score} - #{away_score} #{away})

file = "src/pages/posts/" + datestr + "_" + teams[home] + teams[away]
unless File.exists?(file)
  f = File.open(file, "w+")
  f.puts("---\ntitle: #{title}\npubDate: #{now.to_s}\ntags: [\"野球\"]\nog_title: #{og_title}\n---\n\n#{h2}\n\n#{href}\n\n")
  f.close

  system("git add #{file}")

  puts "投稿テンプレート作成成功"

  system("code #{file}")
else
  puts "記事作成済みです"
end