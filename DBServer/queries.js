module.exports = {
  delayTimePerMonth: `select ap.city, f.delay_year, f.delay_month, f.total_time
                      from (select p.city, p.airport_code
                            from daiyilong.airport_project p
                            where p.city = %s) ap,
                           (select t.delay_year, t.delay_month, t.airport, sum(t.weather_del) as total_time
                            from (select * from daiyilong.delay_more_15 dm15 where dm15.delay_year = %s) t
                            group by(t.delay_year, t.delay_month, t.airport)) f
                      where ap.airport_code = f.airport`,
  weatherReasons: `select final.city, final.event_type, count(*) as effect
                   from (select t2.city, t2.delay_year, t2.delay_month, t1.event_type
                         from (select t.event_year, t.event_month, t.event_type
                               from (select * from daiyilong.weatherevent w where w.event_year = %s) t
                               group by(t.event_year, t.event_month, t.event_type)) t1,
                              (select ap.city, f.delay_year, f.delay_month, f.total_time
                               from (select p.city, p.airport_code
                                     from daiyilong.airport_project p
                                     where p.city = %s) ap,
                                    (select t.delay_year, t.delay_month, t.airport, sum(t.weather_del) as total_time
                                     from (select *
                                           from daiyilong.delay_more_15 dm15
                                           where dm15.delay_year = %s) t
                                     group by(t.delay_year, t.delay_month, t.airport)) f
                               where ap.airport_code = f.airport) t2
                         where t1.event_year = t2.delay_year
                           and t1.event_month = t2.delay_month) final
                   group by (final.city, final.event_type)`,
  mostDelayPerYear: `select *
                     from (select carrier, delay_month, sum(carrier_delay) total_delay
                           from daiyilong.delay_more_15
                           where delay_year = %s
                             and carrier in (select carrier
                             from (select carrier
                               , sum (carrier_delay) as total_time
                             from daiyilong.delay_more_15 dm15
                             where dm15.delay_year = %s
                             group by dm15.carrier
                             order by total_time desc fetch first 1 rows only))
                           group by delay_month, carrier
                           order by delay_month + 0)
                            natural join daiyilong.carrier`,
  delayTypeCompareByYear: `select *
                           from ((select sum(security_delay)      as security_delay,
                                         sum(late_aircraft_delay) as late_aircraft_delay,
                                         sum(weather_del)         as weather_delay,
                                         sum(nas_delay)           as nas_delay,
                                         sum(carrier_delay)       as carrier_delay, %s as year
                                  from
                                    daiyilong.delay_more_15
                                  where delay_year= %s and delay_month = %s)
                                 union
                                 select sum(security_delay)      as security_delay,
                                        sum(late_aircraft_delay) as late_aircraft_delay,
                                        sum(weather_del)         as weather_delay,
                                        sum(nas_delay)           as nas_delay,
                                        sum(carrier_delay)       as carrier_delay, %s as year
                                 from
                                   daiyilong.delay_more_15
                                 where delay_year= %s and delay_month = %s)
                           order by year asc`,
  securityDelays: `select ap.airport_name, final.total_no_of_delays
                   from daiyilong.airport_project ap,
                        (select f1.delay_year,
                                f1.delay_month,
                                f1.airport,
                                f1.no_of_delays + f2.no_of_delays as total_no_of_delays
                         from (select t.delay_year, t.delay_month, t.airport, count(t.security_delay) as no_of_delays
                               from (select *
                                     from daiyilong.delay_more_15 dm15
                                     where dm15.delay_year = %s
                                       and dm15.delay_month = %s
                                       and dm15.security_delay
                                         > 0) t
                               group by (t.delay_year, t.delay_month, t.airport)) f1,

                              (select t1.delay_year, t1.delay_month, t1.airport, count(t1.security_ct) as no_of_delays
                               from (select *
                                     from daiyilong.delay_less_15 dl15
                                     where dl15.delay_year = %s
                                       and dl15.delay_month = %s
                                       and dl15.security_ct
                                         > 0) t1
                               group by (t1.delay_year, t1.delay_month, t1.airport)) f2

                         where f1.delay_year = f2.delay_year
                           and f1.delay_month = f2.delay_month
                           and f1.airport = f2.airport) final
                   where ap.airport_code = final.airport
                   order by final.total_no_of_delays desc fetch first 5 rows only`,
  dissatisfaction: `select *
                    from (select t.carrier, disAmount / totalFlights * 100 as dissatisfaction_rate
                          from (select carrier, count(*) as disAmount
                                from daiyilong.delay_more_15 dm15
                                where dm15.arr_delay >
                                      (select avg(totalDelay) as avgDelay
                                       from (select departure_delay + arrival_delay as totalDelay, customer_id
                                             from daiyilong.airline_passenger_satisfaction aps
                                             where aps.satisfaction != 'Satisfied'))
                                  and dm15.delay_year = %s
                                group by carrier) d,
                               (select carrier, sum(arr_flights) as totalFlights
                                from daiyilong.airline_change
                                group by carrier) t
                          where d.carrier = t.carrier
                          order by dissatisfaction_rate desc fetch first 5 rows only)
                           natural join daiyilong.carrier`,
  years: `select unique airline_year
          from daiyilong.airline_change
          order by airline_year desc`,
  cities: `select unique city
           from daiyilong.airport_project`
}
